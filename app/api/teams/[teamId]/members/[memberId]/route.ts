import { createClient } from "@/lib/superbase.server";
import { NextResponse } from "next/server";

// DELETE: Remove member from team
export async function DELETE(
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

    // Get current user's membership
    const { data: currentUserMembership, error: membershipError } =
      await supabase
        .from("team_members")
        .select("role")
        .eq("team_id", teamId)
        .eq("user_id", user.id)
        .single();

    // Only team admins and owners can remove members
    if (
      !currentUserMembership ||
      !["owner", "admin"].includes(currentUserMembership.role)
    ) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Get the member being removed
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

    // Prevent removing yourself
    if (targetMember.user_id === user.id) {
      return NextResponse.json(
        { error: "You cannot remove yourself from the team" },
        { status: 400 }
      );
    }

    // Only owners can remove other owners
    if (
      targetMember.role === "owner" &&
      currentUserMembership.role !== "owner"
    ) {
      return NextResponse.json(
        { error: "Only team owners can remove other owners" },
        { status: 403 }
      );
    }

    // Delete the team membership
    const { error: deleteError } = await supabase
      .from("team_members")
      .delete()
      .eq("id", memberId);

    if (deleteError) {
      console.error("Error removing team member:", deleteError);
      return NextResponse.json(
        { error: "Failed to remove team member" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error in remove team member endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
