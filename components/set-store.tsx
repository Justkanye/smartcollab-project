"use client";

import { useEffect } from "react";

import { useStore, StoreType } from "@/hooks/use-store";
import { useShallow } from "zustand/shallow";

type SetStoreProps = {
  tasks?: StoreType["tasks"];
  projects?: StoreType["projects"];
  organizations?: StoreType["organizations"];
  currentOrganizationId?: StoreType["currentOrganizationId"];
  user?: StoreType["user"];
};

const SetStore = ({
  tasks,
  projects,
  organizations,
  currentOrganizationId,
  user,
}: SetStoreProps) => {
  const [
    setTasks,
    setProjects,
    setOrganizations,
    setCurrentOrganizationId,
    setUser,
  ] = useStore(
    useShallow(state => [
      state.setTasks,
      state.setProjects,
      state.setOrganizations,
      state.setCurrentOrganizationId,
      state.setUser,
    ])
  );
  useEffect(() => {
    if (tasks) setTasks(tasks);
    if (projects) setProjects(projects);
    if (organizations) setOrganizations(organizations);
    if (currentOrganizationId) setCurrentOrganizationId(currentOrganizationId);
    if (user) setUser(user);
  }, []);
  return null;
};

export default SetStore;
