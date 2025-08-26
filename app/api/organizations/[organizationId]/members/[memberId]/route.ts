import { createClient } from "@/lib/superbase.server";
import { NextResponse } from "next/server";

// DELETE: Remove member from organization
export async function DELETE(
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

    // Get current user's membership
    const { data: currentUserMembership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .single();

    // Only owners and admins can remove members
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
      .from("organization_members")
      .select("role, user_id")
      .eq("id", memberId)
      .eq("organization_id", organizationId)
      .single();

    if (targetError || !targetMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Prevent removing yourself
    if (targetMember.user_id === user.id) {
      return NextResponse.json(
        { error: "You cannot remove yourself from the organization" },
        { status: 400 }
      );
    }

    // Only owners can remove other owners
    if (
      targetMember.role === "owner" &&
      currentUserMembership.role !== "owner"
    ) {
      return NextResponse.json(
        { error: "Only organization owners can remove other owners" },
        { status: 403 }
      );
    }

    // Delete the member
    const { error: deleteError } = await supabase
      .from("organization_members")
      .delete()
      .eq("id", memberId);

    if (deleteError) {
      console.error("Error removing member:", deleteError);
      return NextResponse.json(
        { error: "Failed to remove member" },
        { status: 500 }
      );
    }

    // Remove from all teams in this organization
    const { error: teamError } = await supabase
      .from("team_members")
      .delete()
      .eq("user_id", targetMember.user_id)
      .in(
        "team_id",
        supabase
          .from("teams")
          .select("id")
          .eq("organization_id", organizationId)
      );

    if (teamError) {
      console.error("Error removing member from teams:", teamError);
      // Don't fail the request if we couldn't remove from teams
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error in remove member endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
