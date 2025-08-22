import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "active":
    case "In Progress":
      return "default";
    case "completed":
    case "Done":
      return "secondary";
    case "planning":
    case "To Do":
      return "outline";
    case "on-hold":
      return "destructive";
    default:
      return "outline";
  }
};

export const getPriorityBadgeVariant = (priority: string) => {
  switch (priority) {
    case "high":
    case "High":
      return "destructive";
    case "medium":
    case "Medium":
      return "default";
    case "low":
    case "Low":
      return "secondary";
    default:
      return "outline";
  }
};
