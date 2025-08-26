import { createClient } from "@/lib/superbase.server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Invitation token is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to accept an invitation" },
        { status: 401 }
      );
    }

    // Check if the token exists and is not expired
    const { data: orgInvitation, error: orgInviteError } = await supabase
      .from("organization_invitations")
      .select("*")
      .eq("token", token)
      .gt("expires_at", new Date().toISOString())
      .single();

    const { data: teamInvitation, error: teamInviteError } = orgInvitation
      ? { data: null, error: null }
      : await supabase
          .from("team_invitations")
          .select("*")
          .eq("token", token)
          .gt("expires_at", new Date().toISOString())
          .single();

    const invitation = orgInvitation || teamInvitation;
    const inviteError = orgInviteError || teamInviteError;

    if (inviteError || !invitation) {
      return NextResponse.json(
        { error: "Invalid or expired invitation" },
        { status: 400 }
      );
    }

    // Check if the invitation is for the logged-in user's email
    if (invitation.email !== user.email) {
      return NextResponse.json(
        { error: "This invitation is not for your email address" },
        { status: 403 }
      );
    }

    // Start a transaction
    const { data, error } = await supabase.rpc("accept_invitation", {
      p_invitation_id: invitation.id,
      p_invitation_type: orgInvitation ? "organization" : "team",
      p_user_id: user.id,
      p_email: user.email,
    });

    if (error) {
      console.error("Error accepting invitation:", error);
      return NextResponse.json(
        { error: error.message || "Failed to accept invitation" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      redirectTo: orgInvitation
        ? `/organizations/${invitation.organization_id}`
        : `/teams/${invitation.team_id}`,
    });
  } catch (error) {
    console.error("Error in accept invitation endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
