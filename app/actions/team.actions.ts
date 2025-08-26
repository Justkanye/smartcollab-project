"use server";

import { createClient } from "@/lib/superbase.server";
import { revalidatePath } from "next/cache";
import { getUser } from "./auth.actions";
import { Team, TeamMember, TeamInvitation } from "@/types";

export async function getTeams(organizationId: string) {
  try {
    const supabase = await createClient();
    const { data: user } = await getUser();

    if (!user) {
      return { data: [], error: "User not authenticated" };
    }

    // First, get all team IDs where the user is a member
    const { data: userTeams, error: userTeamsError } = await supabase
      .from("team_members")
      .select("team_id, role")
      .eq("user_id", user.id);

    if (userTeamsError) {
      console.error("Error fetching user's teams:", userTeamsError);
      return { data: [], error: userTeamsError.message };
    }

    if (!userTeams || userTeams.length === 0) {
      return { data: [], error: null }; // No teams found for user
    }

    // Then get the full team details for those teams in the organization
    const teamIds = userTeams.map(tm => tm.team_id);
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("*")
      .eq("organization_id", organizationId)
      .in("id", teamIds);

    if (teamsError) {
      console.error("Error fetching teams:", teamsError);
      return { data: [], error: teamsError.message };
    }

    // Add the user's role to each team
    const teamsWithRole = teams.map(team => ({
      ...team,
      role: userTeams.find(tm => tm.team_id === team.id)?.role || 'member'
    }));

    return { data: teamsWithRole as Team[], error: null };
  } catch (error) {
    console.error("Error in getTeams:", error);
    return { data: [], error: "Failed to fetch teams" };
  }
}

export async function getTeam(teamId: string) {
  try {
    const supabase = await createClient();
    const { data: user } = await getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    // First, check if the user is a member of this team
    const { data: membership, error: membershipError } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .single();

    if (membershipError || !membership) {
      return { data: null, error: "You are not a member of this team" };
    }

    // Then get the team details
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("*")
      .eq("id", teamId)
      .single();

    if (teamError) {
      console.error("Error fetching team:", teamError);
      return { data: null, error: teamError.message };
    }

    // Add the user's role to the team
    const teamWithRole = {
      ...team,
      role: membership.role
    };

    return { data: teamWithRole as Team, error: null };
  } catch (error) {
    console.error("Error in getTeam:", error);
    return { data: null, error: "Failed to fetch team" };
  }
}

export async function createTeam(teamData: {
  name: string;
  description?: string;
  organization_id: string;
}) {
  try {
    const supabase = await createClient();
    const { data: user } = await getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("teams")
      .insert([
        {
          name: teamData.name,
          description: teamData.description,
          organization_id: teamData.organization_id,
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating team:", error);
      return { data: null, error: error.message };
    }

    // Add the creator as an admin member
    await supabase.from("team_members").insert([
      {
        team_id: data.id,
        user_id: user.id,
        role: "admin",
        status: "active",
        joined_at: new Date().toISOString(),
      },
    ]);

    revalidatePath(`/organization/${teamData.organization_id}/teams`);
    return { data: data as Team, error: null };
  } catch (error) {
    console.error("Error in createTeam:", error);
    return { data: null, error: "Failed to create team" };
  }
}

export async function updateTeam(teamId: string, updates: Partial<Team>) {
  try {
    const supabase = await createClient();
    const { data: user } = await getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("teams")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", teamId)
      .select()
      .single();

    if (error) {
      console.error("Error updating team:", error);
      return { data: null, error: error.message };
    }

    revalidatePath(`/organization/${data.organization_id}/teams`);
    return { data: data as Team, error: null };
  } catch (error) {
    console.error("Error in updateTeam:", error);
    return { data: null, error: "Failed to update team" };
  }
}

export async function deleteTeam(teamId: string) {
  try {
    const supabase = await createClient();
    const { data: user } = await getUser();

    if (!user) {
      return { error: "User not authenticated" };
    }

    // First get the team to get organization_id for revalidation
    const { data: team } = await supabase
      .from("teams")
      .select("organization_id")
      .eq("id", teamId)
      .single();

    if (!team) {
      return { error: "Team not found" };
    }

    const { error } = await supabase.from("teams").delete().eq("id", teamId);

    if (error) {
      console.error("Error deleting team:", error);
      return { error: error.message };
    }

    revalidatePath(`/organization/${team.organization_id}/teams`);
    return { error: null };
  } catch (error) {
    console.error("Error in deleteTeam:", error);
    return { error: "Failed to delete team" };
  }
}

export async function getTeamMembers(teamId: string) {
  try {
    const supabase = await createClient();
    const { data: user } = await getUser();

    if (!user) {
      return { data: [], error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("team_members")
      .select(
        `
        *,
        user:profiles!inner(
          id,
          email,
          full_name,
          avatar_url
        )
      `
      )
      .eq("team_id", teamId);

    if (error) {
      console.error("Error fetching team members:", error);
      return { data: [], error: error.message };
    }

    return { data: data as TeamMember[], error: null };
  } catch (error) {
    console.error("Error in getTeamMembers:", error);
    return { data: [], error: "Failed to fetch team members" };
  }
}

export async function addTeamMember(
  teamId: string,
  userId: string,
  role: string = "member"
) {
  try {
    const supabase = await createClient();
    const { data: user } = await getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from("team_members")
      .select()
      .eq("team_id", teamId)
      .eq("user_id", userId)
      .single();

    if (existingMember) {
      return { data: null, error: "User is already a member of this team" };
    }

    const { data, error } = await supabase
      .from("team_members")
      .insert([
        {
          team_id: teamId,
          user_id: userId,
          role,
          status: "active",
          joined_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding team member:", error);
      return { data: null, error: error.message };
    }

    revalidatePath(`/teams/${teamId}/members`);
    return { data: data as TeamMember, error: null };
  } catch (error) {
    console.error("Error in addTeamMember:", error);
    return { data: null, error: "Failed to add team member" };
  }
}

export async function updateTeamMember(
  teamId: string,
  userId: string,
  updates: { role?: string; status?: string }
) {
  try {
    const supabase = await createClient();
    const { data: user } = await getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("team_members")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("team_id", teamId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating team member:", error);
      return { data: null, error: error.message };
    }

    revalidatePath(`/teams/${teamId}/members`);
    return { data: data as TeamMember, error: null };
  } catch (error) {
    console.error("Error in updateTeamMember:", error);
    return { data: null, error: "Failed to update team member" };
  }
}

export async function removeTeamMember(teamId: string, userId: string) {
  try {
    const supabase = await createClient();
    const { data: user } = await getUser();

    if (!user) {
      return { error: "User not authenticated" };
    }

    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("team_id", teamId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error removing team member:", error);
      return { error: error.message };
    }

    revalidatePath(`/teams/${teamId}/members`);
    return { error: null };
  } catch (error) {
    console.error("Error in removeTeamMember:", error);
    return { error: "Failed to remove team member" };
  }
}

export async function inviteTeamMember(
  teamId: string,
  email: string,
  role: string = "member"
) {
  try {
    const supabase = await createClient();
    const { data: user } = await getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase.rpc(
      "check_team_membership",
      { p_team_id: teamId, p_email: email }
    );

    if (existingMember) {
      return { data: null, error: "User is already a member of this team" };
    }

    // Check if there's already a pending invitation
    const { data: existingInvite } = await supabase
      .from("team_invitations")
      .select()
      .eq("team_id", teamId)
      .eq("email", email)
      .is("accepted_at", null)
      .single();

    if (existingInvite) {
      return {
        data: null,
        error: "An invitation is already pending for this email",
      };
    }

    // Generate a token
    const token = require("crypto").randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    const { data, error } = await supabase
      .from("team_invitations")
      .insert([
        {
          team_id: teamId,
          email,
          role,
          token,
          expires_at: expiresAt.toISOString(),
          invited_by: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating team invitation:", error);
      return { data: null, error: error.message };
    }

    // TODO: Send invitation email with the token
    // await sendTeamInvitationEmail(email, user.email!, teamId, token);

    revalidatePath(`/teams/${teamId}/members`);
    return { data: data as TeamInvitation, error: null };
  } catch (error) {
    console.error("Error in inviteTeamMember:", error);
    return { data: null, error: "Failed to invite team member" };
  }
}

export async function getTeamInvitations(teamId: string) {
  try {
    const supabase = await createClient();
    const { data: user } = await getUser();

    if (!user) {
      return { data: [], error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("team_invitations")
      .select(
        `
        *,
        team:teams!inner(
          name,
          organization_id
        ),
        invited_by_profile:profiles!team_invitations_invited_by_fkey(
          full_name,
          email
        )
      `
      )
      .eq("team_id", teamId)
      .is("accepted_at", null);

    if (error) {
      console.error("Error fetching team invitations:", error);
      return { data: [], error: error.message };
    }

    return { data: data as TeamInvitation[], error: null };
  } catch (error) {
    console.error("Error in getTeamInvitations:", error);
    return { data: [], error: "Failed to fetch team invitations" };
  }
}

export async function cancelTeamInvitation(invitationId: string) {
  try {
    const supabase = await createClient();
    const { data: user } = await getUser();

    if (!user) {
      return { error: "User not authenticated" };
    }

    // First get the invitation to get team_id for revalidation
    const { data: invitation } = await supabase
      .from("team_invitations")
      .select("team_id")
      .eq("id", invitationId)
      .single();

    if (!invitation) {
      return { error: "Invitation not found" };
    }

    const { error } = await supabase
      .from("team_invitations")
      .delete()
      .eq("id", invitationId);

    if (error) {
      console.error("Error canceling team invitation:", error);
      return { error: error.message };
    }

    revalidatePath(`/teams/${invitation.team_id}/members`);
    return { error: null };
  } catch (error) {
    console.error("Error in cancelTeamInvitation:", error);
    return { error: "Failed to cancel invitation" };
  }
}
