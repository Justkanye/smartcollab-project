import type { Database } from "@/lib/supabase";

export type Organization =
  Database["public"]["Tables"]["organizations"]["Row"] & {
    member_count?: number;
    user_role?: string;
    user_permissions?: any;
  };

export type OrganizationMember =
  Database["public"]["Tables"]["organization_members"]["Row"] & {
    profiles: {
      full_name: string | null;
      email: string;
      avatar_url: string | null;
    } | null;
  };

export type OrganizationInvitation = {
  id: string;
  organization_id: string;
  email: string;
  role: string;
  token: string;
  expires_at: string;
  created_at: string;
  accepted_at: string | null;
  invited_by: string;
  organizations: {
    name: string;
  } | null;
  invited_by_profile: {
    full_name: string | null;
    email: string;
  } | null;
};

export type Status = "To Do" | "In Progress" | "In Review" | "Done";
export type Priority = "Low" | "Medium" | "High";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: Status;
  priority: Priority;
  progress?: number;
  start_date: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  organization_id: string;
  created_by: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  project_id: string;
  assigned_to: string | null;
  created_by: string;
  project?: {
    id: string;
    name: string;
  };
}
