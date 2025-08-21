"use server";

import { cookies } from "next/headers";

import { Project } from "@/types";
import { getCookieAsync } from "./cookie.actions";
import { createClient } from "@/lib/superbase.server";
import { CURRENT_ORGANIZATION_COOKIE } from "@/lib/constants";

export const fetchProjects = async (): Promise<{
  data: Project[];
  error: string | null;
  currentOrganizationId?: string;
}> => {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return {
        data: [],
        error: null,
      };
    }

    const userRes = await supabase.auth.getUser();
    const user = userRes.data.user;

    // If no user, return empty array
    if (!user) {
      return {
        data: [],
        error: null,
      };
    }

    // Simple query without complex joins
    let query = supabase.from("projects").select("*").eq("created_by", user.id);

    // get currentOrganization from cookies
    const cookieStore = await cookies();
    const currentOrganizationCookie = cookieStore.get(
      CURRENT_ORGANIZATION_COOKIE
    );

    let currentOrganizationId = "";
    // Filter by organization if one is selected
    if (currentOrganizationCookie) {
      const currentOrganization = await supabase
        .from("organizations")
        .select("*")
        .eq("created_by", user.id)
        .eq("id", currentOrganizationCookie.value)
        .single();

      if (currentOrganization.error) {
        console.error(
          "Error fetching current organization:",
          currentOrganization.error
        );
        return {
          data: [],
          error: null,
        };
      }

      query = query.eq("organization_id", currentOrganization.data.id);
    } else {
      const currentOrganization = await supabase
        .from("organizations")
        .select("*")
        .eq("created_by", user.id)
        .single();

      if (currentOrganization.error) {
        console.log(
          "Error fetching current organization:",
          currentOrganization.error
        );
        // if no organization create one
        if (currentOrganization.error.code === "PGRST116") {
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
            return {
              data: [],
              error: null,
            };
          }

          // await setCookie({
          //   name: CURRENT_ORGANIZATION_COOKIE,
          //   value: newOrganization.id,
          //   expiration: 60 * 60 * 24 * 7,
          // });
          currentOrganizationId = newOrganization.id;
          query = query.eq("organization_id", newOrganization.id);
        } else {
          console.error(
            "Error fetching current organization:",
            currentOrganization.error
          );
          return {
            data: [],
            error: null,
          };
        }
      } else {
        // set current organization cookie
        // await setCookie({
        //   name: CURRENT_ORGANIZATION_COOKIE,
        //   value: currentOrganization.data.id,
        //   expiration: 60 * 60 * 24 * 7,
        // });
        currentOrganizationId = currentOrganization.data.id;
        query = query.eq("organization_id", currentOrganization.data.id);
      }
    }

    const { data, error: fetchError } = await query.order("updated_at", {
      ascending: false,
    });

    if (fetchError) {
      console.error("Error fetching projects:", fetchError);
      // Fall back to sample data on error
      return {
        data: [],
        error: null,
      };
    } else {
      return {
        data: data || [],
        error: null,
        currentOrganizationId,
      };
    }
  } catch (err) {
    console.error("Error fetching projects:", err);
    // Fall back to sample data on error
    return {
      data: [],
      error: null,
    };
  }
};

export const createProject = async (
  projectData: Omit<
    Project,
    "id" | "organization_id" | "created_at" | "updated_at" | "created_by"
  >
) => {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return { data: null, error: "Supabase client not initialized" };
    }
    const userRes = await supabase.auth.getUser();
    const user = userRes.data.user;

    if (!user) {
      return {
        data: null,
        error: "User not authenticated",
      };
    }

    const currentOrganizationCookie = await getCookieAsync(
      CURRENT_ORGANIZATION_COOKIE
    );
    let currentOrganization = null;
    if (currentOrganizationCookie) {
      currentOrganization = currentOrganizationCookie.value;
    }

    const { data, error } = await supabase
      .from("projects")
      .insert([
        {
          ...projectData,
          created_by: user.id,
          organization_id: currentOrganization,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    await fetchProjects();
    return { data, error: null };
  } catch (err: any) {
    console.log(err);
    console.log(projectData);
    const errorMessage = err?.message || "An error occurred";
    return { data: null, error: errorMessage };
  }
};
