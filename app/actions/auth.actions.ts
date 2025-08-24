"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/superbase.server";
import { CURRENT_ORGANIZATION_COOKIE } from "@/lib/constants";

export async function login(email: string, password: string) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: email,
    password: password,
  };

  const { error, data: user } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error };
  }

  //   If an organization exists for the user, set it as the current organization
  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("created_by", user.user.id)
    .single();

  if (organization) {
    const cookieStore = await cookies();
    cookieStore.set(CURRENT_ORGANIZATION_COOKIE, organization.id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(
  email: string,
  password: string,
  fullName: string
) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: email,
    password: password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    return { error };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export const signOut = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/signin");
};

export const getUser = async () => {
  const supabase = await createClient();
  try {
    if (!supabase) {
      return {
        data: null,
        error: "Supabase client not initialized",
      };
    }

    const userRes = await supabase.auth.getUser();
    const user = userRes.data.user;

    return { data: user, error: null };
  } catch (error) {
    console.error("Error fetching user:", error);
    return { data: null, error: "User not authenticated" };
  }
};
