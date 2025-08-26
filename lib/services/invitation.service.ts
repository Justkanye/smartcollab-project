import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/lib/superbase.server";

export interface InvitationResult {
  success: boolean;
  error?: string;
  invitation?: any;
}

export class InvitationService {
  private static readonly INVITATION_EXPIRY_DAYS = 7;

  static async createOrganizationInvitation(
    organizationId: string,
    email: string,
    role: string = "member"
  ): Promise<InvitationResult> {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Check if user has permission to invite
    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .single();

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return { success: false, error: "Insufficient permissions" };
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from("organization_members")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("email", email)
      .single();

    if (existingMember) {
      return {
        success: false,
        error: "User is already a member of this organization",
      };
    }

    // Create invitation
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.INVITATION_EXPIRY_DAYS);

    const { data: invitation, error } = await supabase
      .from("organization_invitations")
      .insert([
        {
          organization_id: organizationId,
          email,
          role,
          invited_by: user.id,
          token,
          expires_at: expiresAt.toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating organization invitation:", error);
      return { success: false, error: error.message };
    }

    return { success: true, invitation };
  }

  static async createTeamInvitation(
    teamId: string,
    email: string,
    role: string = "member"
  ): Promise<InvitationResult> {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Get team and organization info
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("id, organization_id")
      .eq("id", teamId)
      .single();

    if (teamError || !team) {
      return { success: false, error: "Team not found" };
    }

    // Check if user has permission to invite to team
    const { data: membership } = await supabase.rpc("check_team_permission", {
      p_team_id: teamId,
      p_user_id: user.id,
      p_required_permission: "invite_members",
    });

    if (!membership) {
      return { success: false, error: "Insufficient permissions" };
    }

    // Check if user is already a team member
    const { data: existingMember } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", teamId)
      .eq("email", email)
      .single();

    if (existingMember) {
      return { success: false, error: "User is already a member of this team" };
    }

    // Create invitation
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.INVITATION_EXPIRY_DAYS);

    const { data: invitation, error: inviteError } = await supabase
      .from("team_invitations")
      .insert([
        {
          team_id: teamId,
          organization_id: team.organization_id,
          email,
          role,
          invited_by: user.id,
          token,
          expires_at: expiresAt.toISOString(),
        },
      ])
      .select()
      .single();

    if (inviteError) {
      console.error("Error creating team invitation:", inviteError);
      return { success: false, error: inviteError.message };
    }

    return { success: true, invitation };
  }

  static async acceptInvitation(token: string): Promise<InvitationResult> {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Check organization invitation first
    const { data: orgInvitation } = await supabase
      .from("organization_invitations")
      .select("*")
      .eq("token", token)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (orgInvitation) {
      return this.acceptOrganizationInvitation(user.id, orgInvitation);
    }

    // Check team invitation
    const { data: teamInvitation } = await supabase
      .from("team_invitations")
      .select("*")
      .eq("token", token)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (teamInvitation) {
      return this.acceptTeamInvitation(user.id, teamInvitation);
    }

    return { success: false, error: "Invalid or expired invitation" };
  }

  private static async acceptOrganizationInvitation(
    userId: string,
    invitation: any
  ): Promise<InvitationResult> {
    const supabase = await createClient();

    // Add user to organization
    const { data: member, error } = await supabase
      .from("organization_members")
      .upsert(
        {
          organization_id: invitation.organization_id,
          user_id: userId,
          email: invitation.email,
          role: invitation.role,
          status: "active",
          invited_by: invitation.invited_by,
          joined_at: new Date().toISOString(),
        },
        {
          onConflict: "organization_id,user_id",
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Error accepting organization invitation:", error);
      return { success: false, error: error.message };
    }

    // Delete the invitation
    await supabase
      .from("organization_invitations")
      .delete()
      .eq("id", invitation.id);

    return { success: true, invitation: member };
  }

  private static async acceptTeamInvitation(
    userId: string,
    invitation: any
  ): Promise<InvitationResult> {
    const supabase = await createClient();

    // First ensure user is an organization member
    const { data: orgMember } = await supabase
      .from("organization_members")
      .select("id")
      .eq("organization_id", invitation.organization_id)
      .eq("user_id", userId)
      .single();

    if (!orgMember) {
      return {
        success: false,
        error: "You must be a member of the organization first",
      };
    }

    // Add user to team
    const { data: member, error } = await supabase
      .from("team_members")
      .upsert(
        {
          team_id: invitation.team_id,
          user_id: userId,
          email: invitation.email,
          role: invitation.role,
          joined_at: new Date().toISOString(),
        },
        {
          onConflict: "team_id,user_id",
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Error accepting team invitation:", error);
      return { success: false, error: error.message };
    }

    // Delete the invitation
    await supabase.from("team_invitations").delete().eq("id", invitation.id);

    return { success: true, invitation: member };
  }
}
