import { create } from "zustand";
import { User } from "@supabase/supabase-js";
import { devtools } from "zustand/middleware";

import { Task, Organization, Project } from "@/types";

export type StoreType = {
  user: User | null;
  tasks: Task[];
  projects: Project[];
  organizations: Organization[];
  currentOrganizationId: string | null;
  setUser: (user: User | null) => void;
  setCurrentOrganizationId: (id: string | null) => void;
  setTasks: (tasks: Task[]) => void;
  addOrUpdateTask: (task: Task) => void;
  removeTask: (taskID: string) => void;
  setProjects: (projects: Project[]) => void;
  addOrUpdateProject: (project: Project) => void;
  removeProject: (projectID: string) => void;
  setOrganizations: (organizations: Organization[]) => void;
  addOrUpdateOrganization: (organization: Organization) => void;
  removeOrganization: (organizationID: string) => void;
};

export const useStore = create<StoreType>()(
  devtools((set, get) => ({
    user: null,
    tasks: [],
    projects: [],
    organizations: [],
    currentOrganizationId: null,
    setUser: (user: User | null) => set({ user }),
    setCurrentOrganizationId: (id: string | null) =>
      set({ currentOrganizationId: id }),
    setTasks: (tasks: Task[]) => set({ tasks }),
    addOrUpdateTask: (task: Task) =>
      set(state => {
        const taskExists = state.tasks.some(t => t.id === task.id);
        if (taskExists) {
          return {
            tasks: state.tasks.map(t => (t.id === task.id ? task : t)),
          };
        }
        return { tasks: [...state.tasks, task] };
      }),
    removeTask: (taskID: string) =>
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== taskID),
      })),
    setProjects: (projects: Project[]) => set({ projects }),
    addOrUpdateProject: (project: Project) =>
      set(state => {
        const projectExists = state.projects.some(p => p.id === project.id);
        if (projectExists) {
          return {
            projects: state.projects.map(p =>
              p.id === project.id ? project : p
            ),
          };
        }
        return { projects: [...state.projects, project] };
      }),
    removeProject: (projectID: string) =>
      set(state => ({
        projects: state.projects.filter(project => project.id !== projectID),
      })),
    setOrganizations: (organizations: Organization[]) => set({ organizations }),
    addOrUpdateOrganization: (organization: Organization) =>
      set(state => {
        const orgExists = state.organizations.some(
          o => o.id === organization.id
        );
        if (orgExists) {
          return {
            organizations: state.organizations.map(o =>
              o.id === organization.id ? organization : o
            ),
          };
        }
        return { organizations: [...state.organizations, organization] };
      }),
    removeOrganization: (organizationID: string) =>
      set(state => ({
        organizations: state.organizations.filter(
          org => org.id !== organizationID
        ),
      })),
  }))
);
