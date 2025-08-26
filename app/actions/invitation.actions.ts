"use server";

import { InvitationService } from "@/lib/services/invitation.service";
import { createClient } from "@/lib/superbase.server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { sendInvitationEmail } from "@/lib/services/email.service";
import { env } from "@/lib/env";

export async function inviteToOrganization(
  organizationId: string,
  email: string,
  role: string = "member"
) {
  const supabase = await createClient();

  // Get inviter's name and organization name
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: organization } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", organizationId)
    .single();

  if (!user || !organization) {
    return { success: false, error: "User or organization not found" };
  }

  const { success, error, invitation } =
    await InvitationService.createOrganizationInvitation(
      organizationId,
      email,
      role
    );

  if (success && invitation) {
    try {
      const invitationLink = `${env.NEXT_PUBLIC_APP_URL}/invitations/accept?token=${invitation.token}`;
      await sendInvitationEmail({
        to: email,
        inviterName: user.user_metadata?.full_name || "A team member",
        teamName: organization.name,
        invitationLink,
        expiresAt: new Date(invitation.expires_at),
      });
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError);
      // Don't fail the whole operation if email sending fails
    }

    revalidatePath(`/organizations/${organizationId}/members`);
  }

  return { success, error };
}

export async function inviteToTeam(
  teamId: string,
  email: string,
  role: string = "member"
) {
  const supabase = await createClient();

  // Get inviter's name and team name
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: team } = await supabase
    .from("teams")
    .select("name, organization:organizations(name)")
    .eq("id", teamId)
    .single();

  if (!user || !team) {
    return { success: false, error: "User or team not found" };
  }

  const { success, error, invitation } =
    await InvitationService.createTeamInvitation(teamId, email, role);

  if (success && invitation) {
    try {
      const invitationLink = `${env.NEXT_PUBLIC_APP_URL}/invitations/accept?token=${invitation.token}`;
      await sendInvitationEmail({
        to: email,
        inviterName: user.user_metadata?.full_name || "A team member",
        teamName: team.name,
        invitationLink,
        expiresAt: new Date(invitation.expires_at),
      });
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError);
      // Don't fail the whole operation if email sending fails
    }

    revalidatePath(`/teams/${teamId}/members`);
  }

  return { success, error };
}

export async function acceptInvitation(token: string) {
  const { success, error } = await InvitationService.acceptInvitation(token);

  if (success) {
    revalidatePath("/");
    revalidatePath("/teams");
    revalidatePath("/organizations");
  }

  return { success, error };
}

export async function getPendingInvitations() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { data: [], error: "Not authenticated" };
  }

  const { data: orgInvitations } = await supabase
    .from("organization_invitations")
    .select("*, organizations(name)")
    .eq("email", user.email)
    .gt("expires_at", new Date().toISOString());

  const { data: teamInvitations } = await supabase
    .from("team_invitations")
    .select("*, teams(name, organizations(name))")
    .eq("email", user.email)
    .gt("expires_at", new Date().toISOString());

  return {
    data: {
      organizations: orgInvitations || [],
      teams: teamInvitations || [],
    },
    error: null,
  };
}
