"use server";

import { Task } from "@/types";
import { getUser } from "./auth.actions";
import { createClient } from "@/lib/superbase.server";

interface FetchTasksParams {
  query?: string;
  status?: string;
  priority?: string;
}

export const fetchTasks = async ({
  query,
  status,
  priority,
}: FetchTasksParams = {}): Promise<{
  data: Task[];
  error: string | null;
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
      .from("tasks")
      .select("*")
      .or(`created_by.eq.${user.id},assigned_to.eq.${user.id}`);

    // Apply text search if query exists
    if (query) {
      queryBuilder = queryBuilder.or(
        `title.ilike.%${query}%,description.ilike.%${query}%`
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

    // Execute the query with ordering
    const { data, error } = await queryBuilder.order("updated_at", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching tasks:", error);
      // Fallback to sample data on any error
      return {
        data: [],
        error: null,
      };
    } else {
      // Transform data to match our interface
      const transformedTasks = (data || []).map(task => ({
        ...task,
        project: task.project_id
          ? { id: task.project_id, name: "Project" }
          : undefined,
      }));
      return {
        data: transformedTasks,
        error: null,
      };
    }
  } catch (err) {
    console.error("Failed to fetch tasks:", err);
    // Fallback to sample data on any error
    return {
      data: [],
      error: null,
    };
  }
};

export const getProjectTasks = async (projectId: string) => {
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
    const { data: tasks, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasks:", error);
      return {
        data: [],
        error: null,
      };
    } else {
      return {
        data: tasks || [],
        error: null,
      };
    }
  } catch (err) {
    console.error("Failed to fetch tasks:", err);
    return {
      data: [],
      error: null,
    };
  }
};

export const createTask = async (
  taskData: Omit<Task, "id" | "created_at" | "updated_at">
) => {
  try {
    const supabase = await createClient();
    const { data: user, error: userError } = await getUser();

    // If no user
    if (!user || userError) {
      return {
        data: null,
        error: userError || "User not authenticated",
      };
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert([
        {
          ...taskData,
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Failed to create task:", error);
    return { data: null, error: "Failed to create task" };
  }
};
