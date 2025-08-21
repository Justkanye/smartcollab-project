"use server";

import { createClient } from "@/lib/superbase.server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export type Organization = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
};

export async function getOrganizations() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: [], error: "User not authenticated" };
  }

  const { data, error } = await supabase
    .from("organization_members")
    .select("organization:organizations(*)")
    .eq("user_id", user.id)
    .eq("status", "active");

  if (error) {
    return { data: [], error: error.message };
  }

  const organizations = data.map(({ organization }) => ({
    ...organization,
    member_count: 1, // This should be updated with actual count if needed
  }));

  return { data: organizations, error: null };
}

export async function createOrganization(orgData: {
  name: string;
  description?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "User not authenticated" };
  }

  const { data, error } = await supabase
    .from("organizations")
    .insert([
      {
        name: orgData.name,
        description: orgData.description,
        created_by: user.id,
      },
    ])
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  // Add the creator as an admin member
  await supabase.from("organization_members").insert([
    {
      organization_id: data.id,
      user_id: user.id,
      role: "admin",
      status: "active",
    },
  ]);

  revalidatePath("/");
  return { data, error: null };
}

export async function updateOrganization(
  id: string,
  updates: Partial<Organization>
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not authenticated" };
  }

  const { error } = await supabase
    .from("organizations")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  return { error: null };
}

export async function setCurrentOrganization(organizationId: string) {
  const cookieStore = await cookies();
  cookieStore.set("current_organization", organizationId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  revalidatePath("/");
  return { success: true };
}
