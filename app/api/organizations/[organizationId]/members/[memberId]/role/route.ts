import { createClient } from "@/lib/superbase.server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

const roleSchema = z.object({
  role: z.enum(["owner", "admin", "member"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: { organizationId: string; memberId: string } }
) {
  try {
    const { organizationId, memberId } = params;
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
    const { data: currentUserMembership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .single();

    // Only owners and admins can update roles
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
      .from("organization_members")
      .select("role, user_id")
      .eq("id", memberId)
      .eq("organization_id", organizationId)
      .single();

    if (targetError || !targetMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Only owners can change owner role
    if (targetMember.role === "owner" || newRole === "owner") {
      if (currentUserMembership.role !== "owner") {
        return NextResponse.json(
          { error: "Only organization owners can manage owner roles" },
          { status: 403 }
        );
      }

      // Ensure there's at least one owner remaining
      if (targetMember.role === "owner" && newRole !== "owner") {
        const { count } = await supabase
          .from("organization_members")
          .select("*", { count: "exact", head: true })
          .eq("organization_id", organizationId)
          .eq("role", "owner");

        if ((count || 0) <= 1) {
          return NextResponse.json(
            { error: "Organization must have at least one owner" },
            { status: 400 }
          );
        }
      }
    }

    // Update the role
    const { error: updateError } = await supabase
      .from("organization_members")
      .update({
        role: newRole,
        updated_at: new Date().toISOString(),
      })
      .eq("id", memberId);

    if (updateError) {
      console.error("Error updating member role:", updateError);
      return NextResponse.json(
        { error: "Failed to update member role" },
        { status: 500 }
      );
    }

    // If demoting from admin, update team memberships to member
    if (targetMember.role === "admin" && newRole === "member") {
      const { error: teamUpdateError } = await supabase
        .from("team_members")
        .update({
          role: "member",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", targetMember.user_id)
        .in(
          "team_id",
          supabase
            .from("teams")
            .select("id")
            .eq("organization_id", organizationId)
        )
        .neq("role", "owner"); // Don't change owner role in teams

      if (teamUpdateError) {
        console.error("Error updating team member roles:", teamUpdateError);
        // Don't fail the request if we couldn't update team roles
      }
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error in update role endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
