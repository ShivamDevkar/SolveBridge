import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useMemo,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { apiFetch } from "@/lib/api";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;

  signInWithPassword: (
    email: string,
    password: string,
  ) => Promise<{ error: Error | null }>;

  signUpWithPassword: (input: {
    email: string;
    password: string;
    profile: Record<string, unknown>;
  }) => Promise<{ error: Error | null; needEmailConfirmation: boolean }>;

  signInWithGoogle: (options?: {
    flow?: "login" | "register";
    role?: string;
  }) => Promise<{
    error: Error | null;
  }>;

  updateUserProfile: (
    profile: Record<string, unknown>,
  ) => Promise<{ error: Error | null }>;

  resetPasswordForEmail: (email: string) => Promise<{ error: Error | null }>;

  updatePassword: (password: string) => Promise<{ error: Error | null }>;

  syncApplicationProfile: (
    profile: Record<string, unknown>,
  ) => Promise<{ error: Error | null }>;

  signOut: () => Promise<{
    error: Error | null;
  }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toError(error: unknown) {
  if (error instanceof Error) {
    return error;
  }

  return new Error("Authentication request failed");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const {
        data: { session: currentSession },
        error,
      } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (error) {
        console.error("Unable to load Supabase session:", error);
      }

      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!mounted) {
        return;
      }

      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signInWithPassword(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (!error && data.user) {
      const metadata = data.user.user_metadata;
      const role = metadata?.role;

      if (
        (role === "CUSTOMER" || role === "PROFESSIONAL") &&
        typeof metadata.firstName === "string" &&
        typeof metadata.lastName === "string"
      ) {
        const { error: syncError } = await syncApplicationProfile({
          ...metadata,
          role,
          firstName: metadata.firstName,
          lastName: metadata.lastName,
          phone:
            typeof metadata.phone === "string" ? metadata.phone : undefined,
          businessName:
            typeof metadata.businessName === "string"
              ? metadata.businessName
              : undefined,
          coverageRadius:
            typeof metadata.coverageRadius === "string" ||
            typeof metadata.coverageRadius === "number"
              ? metadata.coverageRadius
              : undefined,
        });

        if (syncError) {
          console.error(
            "Unable to synchronize application profile:",
            syncError,
          );
        }
      }
    }

    return {
      error: error ? toError(error) : null,
    };
  }

  async function signUpWithPassword(input: {
    email: string;
    password: string;
    profile: Record<string, unknown>;
  }) {
    const { data, error } = await supabase.auth.signUp({
      email: input.email.trim(),
      password: input.password,
      options: {
        data: input.profile,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    return {
      error: error ? toError(error) : null,
      needEmailConfirmation: Boolean(data.user && !data.session),
    };
  }

  async function signInWithGoogle(options?: {
    flow?: "login" | "register";
    role?: string;
  }) {
    const redirectUrl = new URL("/auth/callback", window.location.origin);

    if (options?.flow) {
      redirectUrl.searchParams.set("flow", options.flow);
    }

    if (options?.role) {
      redirectUrl.searchParams.set("role", options.role);
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl.toString(),
      },
    });

    return {
      error: error ? toError(error) : null,
    };
  }

  async function updateUserProfile(profile: Record<string, unknown>) {
    const { error } = await supabase.auth.updateUser({
      data: profile,
    });

    return {
      error: error ? toError(error) : null,
    };
  }

  async function resetPasswordForEmail(email: string) {
    const redirectUrl = new URL("/auth/callback", window.location.origin);
    redirectUrl.searchParams.set("flow", "reset");

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: redirectUrl.toString(),
    });

    return {
      error: error ? toError(error) : null,
    };
  }

  async function updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password });

    return {
      error: error ? toError(error) : null,
    };
  }

  async function syncApplicationProfile(profile: Record<string, unknown>) {
    try {
      await apiFetch("/auth/sync", {
        method: "POST",
        body: JSON.stringify(profile),
      });
      return { error: null };
    } catch (error) {
      return { error: toError(error) };
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();

    return {
      error: error ? toError(error) : null,
    };
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      signInWithPassword,
      signInWithGoogle,
      updateUserProfile,
      resetPasswordForEmail,
      updatePassword,
      syncApplicationProfile,
      signUpWithPassword,
      signOut,
    }),
    [user, session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("Error in useAuth");
  }

  return context;
}
