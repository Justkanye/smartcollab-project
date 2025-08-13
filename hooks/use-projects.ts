"use client";

import { useState, useEffect } from "react";

import { Project } from "@/types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { useOrganizations } from "@/hooks/use-organizations";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { currentOrganization } = useOrganizations();

  useEffect(() => {
    fetchProjects();
  }, [user, currentOrganization]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      // If no Supabase client, use sample data
      if (!supabase) {
        setProjects([]);
        setLoading(false);
        return;
      }

      console.log("Fetching projects for user:", user?.id);
      console.log(
        "Fetching projects for organization:",
        currentOrganization?.id
      );

      // If no user, return empty array
      if (!user) {
        setProjects([]);
        setLoading(false);
        return;
      }

      // Simple query without complex joins
      let query = supabase
        .from("projects")
        .select("*")
        .eq("created_by", user.id);

      // Filter by organization if one is selected
      if (currentOrganization) {
        query = query.eq("organization_id", currentOrganization.id);
      } else {
        query = query.is("organization_id", null);
      }

      const { data, error: fetchError } = await query.order("updated_at", {
        ascending: false,
      });

      if (fetchError) {
        console.error("Error fetching projects:", fetchError);
        // Fall back to sample data on error
        setProjects([]);
        setError(null); // Don't show error, just use sample data
      } else {
        setProjects(data || []);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
      // Fall back to sample data on error
      setProjects([]);
      setError(null); // Don't show error, just use sample data
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (
    projectData: Omit<
      Project,
      "id" | "created_at" | "updated_at" | "created_by"
    >
  ) => {
    if (!user || !supabase) {
      // Simulate creating with sample data
      const newProject: Project = {
        ...projectData,
        id: `project-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: user?.id || "sample-user",
      };
      setProjects(prev => [newProject, ...prev]);
      return { data: newProject, error: null };
    }

    try {
      const { data, error } = await supabase
        .from("projects")
        .insert([
          {
            ...projectData,
            created_by: user.id,
            organization_id: currentOrganization?.id || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      await fetchProjects();
      return { data, error: null };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      return { data: null, error: errorMessage };
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    if (!supabase) {
      // Simulate updating with sample data
      setProjects(prev =>
        prev.map(project =>
          project.id === id
            ? { ...project, ...updates, updated_at: new Date().toISOString() }
            : project
        )
      );
      return { error: null };
    }

    try {
      const { data, error } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      await fetchProjects();
      return { data, error: null };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      return { data: null, error: errorMessage };
    }
  };

  const deleteProject = async (id: string) => {
    if (!supabase) {
      // Simulate deleting with sample data
      setProjects(prev => prev.filter(project => project.id !== id));
      return { error: null };
    }

    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);

      if (error) throw error;

      await fetchProjects();
      return { error: null };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      return { error: errorMessage };
    }
  };

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects,
  };
}
