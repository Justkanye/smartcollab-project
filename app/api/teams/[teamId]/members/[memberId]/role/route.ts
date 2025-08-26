import { createClient } from "@/lib/superbase.server";
import { NextResponse } from "next/server";
import { z } from "zod";

const roleSchema = z.object({
  role: z.enum(["owner", "admin", "member"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: { teamId: string; memberId: string } }
) {
  try {
    const { teamId, memberId } = params;
    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = roleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { role: newRole } = validation.data;

    // Get current user's membership
    const { data: currentUserMembership, error: membershipError } =
      await supabase
        .from("team_members")
        .select("role")
        .eq("team_id", teamId)
        .eq("user_id", user.id)
        .single();

    // Only team admins and owners can update roles
    if (
      !currentUserMembership ||
      !["owner", "admin"].includes(currentUserMembership.role)
    ) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Get the target member
    const { data: targetMember, error: targetError } = await supabase
      .from("team_members")
      .select("role, user_id")
      .eq("id", memberId)
      .eq("team_id", teamId)
      .single();

    if (targetError || !targetMember) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      );
    }

    // Only owners can change owner role
    if (targetMember.role === "owner" || newRole === "owner") {
      if (currentUserMembership.role !== "owner") {
        return NextResponse.json(
          { error: "Only team owners can manage owner roles" },
          { status: 403 }
        );
      }

      // Ensure there's at least one owner remaining
      if (targetMember.role === "owner" && newRole !== "owner") {
        const { count } = await supabase
          .from("team_members")
          .select("*", { count: "exact", head: true })
          .eq("team_id", teamId)
          .eq("role", "owner");

        if ((count || 0) <= 1) {
          return NextResponse.json(
            { error: "Team must have at least one owner" },
            { status: 400 }
          );
        }
      }
    }

    // Update the role
    const { error: updateError } = await supabase
      .from("team_members")
      .update({
        role: newRole,
        updated_at: new Date().toISOString(),
      })
      .eq("id", memberId);

    if (updateError) {
      console.error("Error updating team member role:", updateError);
      return NextResponse.json(
        { error: "Failed to update team member role" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error in update team member role endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
