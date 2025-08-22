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
