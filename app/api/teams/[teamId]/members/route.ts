import { createClient } from "@/lib/superbase.server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const { teamId } = params;
    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a member of the team
    const { data: teamMember, error: teamMemberError } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .single();

    if (teamMemberError || !teamMember) {
      return NextResponse.json(
        { error: "Not a member of this team" },
        { status: 403 }
      );
    }

    // First, get all team members
    const { data: teamMembers, error: membersError } = await supabase
      .from("team_members")
      .select("id, user_id, role, created_at")
      .eq("team_id", teamId)
      .order("created_at", { ascending: true });

    if (membersError) {
      console.error("Error fetching team members:", membersError);
      return NextResponse.json(
        { error: "Failed to fetch team members" },
        { status: 500 }
      );
    }

    // Get all user profiles for the team members
    const userIds = teamMembers?.map(member => member.user_id) || [];
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url")
      .in("id", userIds);

    if (profilesError) {
      console.error("Error fetching user profiles:", profilesError);
      return NextResponse.json(
        { error: "Failed to fetch user profiles" },
        { status: 500 }
      );
    }

    // Combine the data
    const members = teamMembers?.map(member => ({
      ...member,
      user: profiles?.find(profile => profile.id === member.user_id) || null
    })) || [];

    if (membersError) {
      console.error("Error fetching team members:", membersError);
      return NextResponse.json(
        { error: "Failed to fetch team members" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      members: members || [],
      currentUserRole: teamMember.role,
      currentUserId: user.id,
    });
  } catch (error) {
    console.error("Error in team members endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
