import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types/common";

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: UserRole;
}

function dashboardForRole(role: unknown) {
  if (role === "PROFESSIONAL") {
    return "/pro/dashboard";
  }

  if (role === "ADMIN") {
    return "/admin/dashboard";
  }

  return "/customer/dashboard";
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-500">
        Restoring your session...
      </main>
    );
  }

  if (!user) {
    return (
      <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
    );
  }

  const userRole = user.user_metadata?.role;
  if (role && userRole !== role) {
    return <Navigate to={dashboardForRole(userRole)} replace />;
  }

  return children;
}
