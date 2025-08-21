"use server";

import { createClient } from "@/lib/superbase.server";
import { revalidatePath } from "next/cache";

export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  created_at: string;
  link?: string;
  metadata?: Record<string, any>;
}

export async function getNotifications(limit: number = 10) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: [], error: "User not authenticated" };
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { data: [], error: error.message };
  }

  return { data, error: null };
}

export async function getUnreadCount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { count: 0, error: "User not authenticated" };
  }

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("read", false);

  if (error) {
    return { count: 0, error: error.message };
  }

  return { count: count || 0, error: null };
}

export async function markAsRead(notificationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not authenticated" };
  }

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/notifications");
  return { error: null };
}

export async function markAllAsRead() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not authenticated" };
  }

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/notifications");
  return { error: null };
}

export async function createNotification(notification: {
  title: string;
  message: string;
  type?: NotificationType;
  userId: string;
  link?: string;
  metadata?: Record<string, any>;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notifications")
    .insert([
      {
        title: notification.title,
        message: notification.message,
        type: notification.type || "info",
        user_id: notification.userId,
        link: notification.link,
        metadata: notification.metadata,
        read: false,
      },
    ])
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  // In case you want to implement real-time notifications later
  revalidatePath("/notifications");

  return { data, error: null };
}
