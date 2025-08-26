import { NextResponse } from "next/server";
import { createClient } from "@/lib/superbase.server";
import { InvitationService } from "@/lib/services/invitation.service";

export async function POST(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const { teamId } = params;
    const { email, role = "member" } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify user is authenticated and has permission to invite to this team
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if user has permission to invite to this team
    const { data: membership } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .single();

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Create the invitation
    const { success, error } = await InvitationService.createTeamInvitation(
      teamId,
      email,
      role
    );

    if (!success) {
      return NextResponse.json(
        { error: error || "Failed to create invitation" },
        { status: 400 }
      );
    }

    // TODO: Send invitation email

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error inviting team member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
