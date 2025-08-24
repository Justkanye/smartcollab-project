"use server";

import { Project } from "@/types";
import { getUser } from "./auth.actions";
import { createClient } from "@/lib/superbase.server";
import { getCurrentOrganization } from "./organization.actions";

interface FetchProjectsParams {
  query?: string;
  status?: string;
  priority?: string;
}

export const fetchProjects = async ({
  query,
  status,
  priority,
}: FetchProjectsParams = {}): Promise<{
  data: Project[];
  error: string | null;
  currentOrganizationId?: string;
}> => {
  try {
    const supabase = await createClient();
    const { data: user } = await getUser();

    // If no user, return empty array
    if (!user) {
      return {
        data: [],
        error: null,
      };
    }

    // Start building the query
    let queryBuilder = supabase
      .from("projects")
      .select("*")
      .eq("created_by", user.id);

    // Apply text search if query exists
    if (query) {
      queryBuilder = queryBuilder.or(
        `name.ilike.%${query}%,description.ilike.%${query}%`
      );
    }

    // Apply status filter if specified
    if (status) {
      queryBuilder = queryBuilder.eq("status", status);
    }

    // Apply priority filter if specified
    if (priority) {
      queryBuilder = queryBuilder.eq("priority", priority);
    }

    const { data: currentOrganization } = await getCurrentOrganization();

    if (!currentOrganization) {
      return {
        data: [],
        error: "No current organization found",
      };
    }

    queryBuilder = queryBuilder.eq("organization_id", currentOrganization?.id);

    const { data, error: fetchError } = await queryBuilder.order("updated_at", {
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
        currentOrganizationId: currentOrganization?.id,
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
    const { data: user } = await getUser();

    if (!user) {
      return {
        data: null,
        error: "User not authenticated",
      };
    }

    const { data: currentOrganization } = await getCurrentOrganization();

    if (!currentOrganization) {
      return {
        data: null,
        error: "No current organization found",
      };
    }

    const { data, error } = await supabase
      .from("projects")
      .insert([
        {
          ...projectData,
          created_by: user.id,
          organization_id: currentOrganization.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (err: any) {
    console.log(err);
    console.log(projectData);
    const errorMessage = err?.message || "An error occurred";
    return { data: null, error: errorMessage };
  }
};

export const fetchProjectById = async (projectId: string) => {
  try {
    const supabase = await createClient();
    const { data: user } = await getUser();

    if (!user) {
      return {
        data: null,
        error: "User not authenticated",
      };
    }
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();
    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.log(err);
    const errorMessage = err?.message || "An error occurred";
    return { data: null, error: errorMessage };
  }
};
