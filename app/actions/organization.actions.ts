"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/superbase.server";

import { getUser } from "./auth.actions";
import { CURRENT_ORGANIZATION_COOKIE } from "@/lib/constants";

export type Organization = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
};

export async function getOrganizations() {
  try {
    const supabase = await createClient();
    const { data: user } = await getUser();

    if (!user) {
      return { data: [] as Organization[], error: "User not authenticated" };
    }

    // const { data, error } = await supabase
    //   .from("organization_members")
    //   .select("organization:organizations(*)")
    //   .eq("user_id", user.id)
    //   .eq("status", "active");

    // if (error) {
    //   return { data: [] as Organization[], error: error.message };
    // }

    // const organizations = data.map(({ organization }) => ({
    //   ...organization,
    //   member_count: 1, // This should be updated with actual count if needed
    // }));

    // return { data: organizations, error: null };

    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("created_by", user.id);

    if (error) {
      return { data: [] as Organization[], error: error.message };
    }

    return { data: data, error: null };
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return { data: [] as Organization[], error: null };
  }
}

export async function createOrganization(orgData: {
  name: string;
  description?: string;
}) {
  try {
    const supabase = await createClient();
    const { data: user } = await getUser();

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
  } catch (error) {
    console.error("Error creating organization:", error);
    return { data: null, error: null };
  }
}

export async function updateOrganization(
  id: string,
  updates: Partial<Organization>
) {
  try {
    const supabase = await createClient();
    const { data: user } = await getUser();

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
  } catch (error) {
    console.error("Error updating organization:", error);
    return { error: null };
  }
}

export async function setCurrentOrganization(organizationId: string) {
  const cookieStore = await cookies();
  cookieStore.set(CURRENT_ORGANIZATION_COOKIE, organizationId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  revalidatePath("/");
  return { success: true };
}

export async function getCurrentOrganization() {
  try {
    const supabase = await createClient();
    const { data: user } = await getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    const cookieStore = await cookies();
    const currentOrganizationCookie = cookieStore.get(
      CURRENT_ORGANIZATION_COOKIE
    );
    const createAndSetCurrentOrg = async () => {
      const { data: newOrganization, error: createError } = await supabase
        .from("organizations")
        .insert([
          {
            name: "My Organization",
            description: "Personal Organization",
            created_by: user.id,
          },
        ])
        .select()
        .single();

      if (createError) {
        console.error("Error creating default organization:", createError);
        return { data: null, error: createError.message };
      }

      return { data: newOrganization, error: null };
    };

    // Filter by organization if one is selected
    if (currentOrganizationCookie) {
      const currentOrganizationRes = await supabase
        .from("organizations")
        .select("*")
        .eq("created_by", user.id)
        .eq("id", currentOrganizationCookie.value)
        .single();

      if (currentOrganizationRes.error) {
        console.error(
          "Error fetching current organization:",
          currentOrganizationRes.error
        );
        return await createAndSetCurrentOrg();
      }

      return { data: currentOrganizationRes.data, error: null };
    } else {
      const currentOrganizationRes = await supabase
        .from("organizations")
        .select("*")
        .eq("created_by", user.id)
        .single();

      if (currentOrganizationRes.error) {
        console.log(
          "Error fetching current organization:",
          currentOrganizationRes.error
        );
        // if no organization create one
        if (currentOrganizationRes.error.code === "PGRST116") {
          return await createAndSetCurrentOrg();
        } else {
          console.error(
            "Error fetching current organization:",
            currentOrganizationRes.error
          );
          return { data: null, error: currentOrganizationRes.error.message };
        }
      } else {
        if (currentOrganizationRes.data) {
          return { data: currentOrganizationRes.data, error: null };
        } else {
          return await createAndSetCurrentOrg();
        }
      }
    }
  } catch (error) {
    console.error("Error getting current organization:", error);
    return { data: null, error: null };
  }
}
