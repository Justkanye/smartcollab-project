export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  priority: string;
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
  status: "To Do" | "In Progress" | "In Review" | "Done";
  priority: "Low" | "Medium" | "High";
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
