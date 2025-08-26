import { createClient } from "@/lib/superbase.server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { organizationId: string } }
) {
  try {
    const { organizationId } = params;
    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a member of the organization
    const { data: currentUserMembership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .single();

    if (!currentUserMembership) {
      return NextResponse.json(
        { error: "Not a member of this organization" },
        { status: 403 }
      );
    }

    // Fetch all organization members
    const { data: members, error } = await supabase
      .from("organization_members")
      .select(
        `
        id,
        user_id,
        email,
        role,
        status,
        created_at,
        user:profiles(id, email, full_name, avatar_url)
      `
      )
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching members:", error);
      return NextResponse.json(
        { error: "Failed to fetch organization members" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      members: members || [],
      currentUserRole: currentUserMembership.role,
      currentUserId: user.id,
    });
  } catch (error) {
    console.error("Error in organization members endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
