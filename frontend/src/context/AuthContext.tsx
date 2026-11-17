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
import type { UserRole, VerificationStatus } from "@/types/common";

type AuthUser = User & {
  name?: string;
  city?: string;
  businessName?: string;
  category?: string;
  skills?: string[];
  coverageRadius?: string;
  verificationStatus?: VerificationStatus;
  role?: UserRole;
};

interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;

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
  requestPasswordReset: (email: string) => Promise<{
    success: boolean;
    message: string;
    mockResetToken?: string;
  }>;
  validateResetToken: (token: string) => Promise<{
    valid: boolean;
    email?: string;
    error?: string;
  }>;
  resetPassword: (input: {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<{ success: boolean; message: string }>;
  changePassword: (input: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toError(error: unknown) {
  if (error instanceof Error) {
    return error;
  }

  return new Error("Authentication request failed");
}

function toAuthUser(user: User | null): AuthUser | null {
  if (!user) {
    return null;
  }

  const metadata = user.user_metadata ?? {};
  return {
    ...user,
    name:
      (typeof metadata.name === "string" && metadata.name) ||
      (typeof metadata.full_name === "string" && metadata.full_name) ||
      user.email ||
      undefined,
    city: typeof metadata.city === "string" ? metadata.city : undefined,
    businessName:
      typeof metadata.businessName === "string"
        ? metadata.businessName
        : undefined,
    category:
      typeof metadata.category === "string" ? metadata.category : undefined,
    skills: Array.isArray(metadata.skills)
      ? metadata.skills.filter((skill): skill is string => typeof skill === "string")
      : undefined,
    coverageRadius:
      typeof metadata.coverageRadius === "string"
        ? metadata.coverageRadius
        : undefined,
    verificationStatus:
      typeof metadata.verificationStatus === "string"
        ? (metadata.verificationStatus as VerificationStatus)
        : undefined,
    role:
      metadata.role === "CUSTOMER" ||
      metadata.role === "PROFESSIONAL" ||
      metadata.role === "ADMIN"
        ? metadata.role
        : undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
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
      setUser(toAuthUser(currentSession?.user ?? null));
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
      setUser(toAuthUser(currentSession?.user ?? null));
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

  async function requestPasswordReset(email: string) {
    const { error } = await resetPasswordForEmail(email);
    return {
      success: !error,
      message: error
        ? error.message
        : "If an account exists for that email, a reset link has been sent.",
    };
  }

  async function validateResetToken(token: string) {
    return token.trim()
      ? { valid: true }
      : { valid: false, error: "A reset token is required." };
  }

  async function resetPassword(input: {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    if (!input.token.trim()) {
      return { success: false, message: "A reset token is required." };
    }

    const { error } = await updatePassword(input.newPassword);
    return {
      success: !error,
      message: error?.message ?? "Password updated successfully.",
    };
  }

  async function changePassword(input: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    void input.currentPassword;
    void input.confirmPassword;
    const { error } = await updatePassword(input.newPassword);
    return {
      success: !error,
      message: error?.message ?? "Password updated successfully.",
    };
  }

  async function logout() {
    await signOut();
  }

  const role = user?.role ?? null;

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      isLoading: loading,
      isAuthenticated: Boolean(user),
      role,
      signInWithPassword,
      signInWithGoogle,
      updateUserProfile,
      resetPasswordForEmail,
      updatePassword,
      syncApplicationProfile,
      signUpWithPassword,
      signOut,
      requestPasswordReset,
      validateResetToken,
      resetPassword,
      changePassword,
      logout,
    }),
    [user, session, loading, role],
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
