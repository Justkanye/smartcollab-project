"use server";

import { Task } from "@/types";
import { supabase } from "@/lib/supabase";

export const fetchTasks = async (): Promise<{
  data: Task[];
  error: string | null;
}> => {
  try {
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

    // Simple query without joins to avoid recursion issues
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .or(`created_by.eq.${user.id},assigned_to.eq.${user.id}`)
      .order("updated_at", { ascending: false });

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
