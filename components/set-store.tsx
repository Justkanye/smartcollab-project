"use client";

import { useEffect } from "react";

import { useStore, StoreType } from "@/hooks/use-store";

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
  useEffect(() => {
    if (tasks) useStore.setState({ tasks });
    if (projects) useStore.setState({ projects });
    if (organizations) useStore.setState({ organizations });
    if (currentOrganizationId) useStore.setState({ currentOrganizationId });
    if (user) useStore.setState({ user });
  }, []);
  return null;
};

export default SetStore;
