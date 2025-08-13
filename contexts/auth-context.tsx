"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { XCircle } from "lucide-react";
import { ConfigStatus } from "@/components/config-status";
import { validateEnvironment } from "@/lib/config-validation";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updateProfile: (data: any) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const router = useRouter();

  // Check configuration on mount
  useEffect(() => {
    try {
      const validation = validateEnvironment();
      if (!validation.isValid) {
        setConfigError(`Configuration error: ${validation.errors.join(", ")}`);
        setLoading(false);
        return;
      }
      setConfigError(null);
    } catch (error) {
      setConfigError("Failed to validate Supabase configuration");
      setLoading(false);
      return;
    }

    if (!supabase) {
      setConfigError("Supabase client not initialized");
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error("Error getting session:", error);
          setConfigError(`Authentication error: ${error.message}`);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Failed to get session:", error);
        setConfigError("Failed to initialize authentication");
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === "SIGNED_IN") {
        // Create or update user profile
        if (session?.user) {
          await createOrUpdateProfile(session.user);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const createOrUpdateProfile = async (user: User) => {
    const res = await supabase?.from("profiles").upsert({
      id: user.id,
      email: user.email!,
      full_name: user.user_metadata?.full_name || null,
      avatar_url: user.user_metadata?.avatar_url || null,
      updated_at: new Date().toISOString(),
    });

    if (res?.error) {
      console.error("Error creating/updating profile:", res.error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const res = await supabase?.auth.signInWithPassword({
      email,
      password,
    });
    return { error: res?.error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const res = await supabase?.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { error: res?.error };
  };

  const signOut = async () => {
    await supabase?.auth.signOut();
    router.push("/auth/signin");
  };

  const resetPassword = async (email: string) => {
    const res = await supabase?.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { error: res?.error };
  };

  const updateProfile = async (data: any) => {
    if (!user) return { error: "No user found" };

    const res = await supabase
      ?.from("profiles")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    return { error: res?.error };
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  };

  if (configError) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4'>
        <Card className='w-full max-w-md'>
          <CardHeader className='text-center'>
            <div className='flex items-center justify-center mb-4'>
              <XCircle className='h-12 w-12 text-red-600' />
            </div>
            <CardTitle className='text-xl text-red-600'>
              Configuration Error
            </CardTitle>
            <CardDescription>{configError}</CardDescription>
          </CardHeader>
          <CardContent>
            <ConfigStatus />
          </CardContent>
        </Card>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
