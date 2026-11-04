import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

function getDashboardPath(userRole: unknown) {
  if (userRole === "PROFESSIONAL") {
    return "/pro/dashboard";
  }

  if (userRole === "ADMIN") {
    return "/admin/dashboard";
  }

  return "/customer/dashboard";
}

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const hasStartedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;

    async function completeAuthentication() {
      try {
        const params = new URLSearchParams(window.location.search);

        const code = params.get("code");
        const flow = params.get("flow");
        const role = params.get("role");

        let authenticatedUser = null;

        if (code) {
          const { data, error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            throw exchangeError;
          }

          authenticatedUser = data.session?.user ?? null;
        }

        if (!authenticatedUser) {
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          if (sessionError) {
            throw sessionError;
          }

          authenticatedUser = session?.user ?? null;
        }

        if (!authenticatedUser) {
          throw new Error("No authenticated user was returned");
        }

        window.history.replaceState({}, document.title, "/auth/callback");

        if (flow === "register") {
          const registrationParams = new URLSearchParams({
            google: "complete",
            role: role === "PROFESSIONAL" ? "PROFESSIONAL" : "CUSTOMER",
          });

          navigate(`/auth/register?${registrationParams.toString()}`, {
            replace: true,
          });
          return;
        }

        if (flow === "reset") {
          navigate("/auth/reset-password", { replace: true });
          return;
        }

        navigate(
          getDashboardPath(authenticatedUser.user_metadata?.role ?? role),
          {
            replace: true,
          },
        );
      } catch (callbackError) {
        setError(
          callbackError instanceof Error
            ? callbackError.message
            : "Unable to complete authentication",
        );
      }
    }

    void completeAuthentication();
  }, [navigate]);

  if (error) {
    return (
      <main className="p-8 text-center">
        <h1 className="text-xl font-bold text-red-700">
          Authentication failed
        </h1>

        <p className="mt-2 text-sm text-slate-600">{error}</p>

        <a
          href="/auth/login"
          className="mt-4 inline-block text-blue-600 underline"
        >
          Return to sign in
        </a>
      </main>
    );
  }

  return (
    <main className="p-8 text-center">
      <p className="text-slate-600">Completing sign in...</p>
    </main>
  );
}
