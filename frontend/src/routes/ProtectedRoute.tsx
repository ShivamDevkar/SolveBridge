// [FRONTEND NAVIGATION CONTROL ONLY]: Client-side routing helper to guide users to appropriate UI screens.
// Does NOT enforce backend authorization, API resource security, or job-level access boundaries.

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/common';
import { Loader2 } from 'lucide-react';

export interface ProtectedRouteProps {
  /**
   * Optional array of allowed roles.
   * If omitted, any authenticated user is granted access.
   * Supports multiple roles (e.g. ['CUSTOMER', 'PROFESSIONAL', 'ADMIN'] for Job Workspace).
   */
  allowedRoles?: UserRole[];
  /**
   * Path to redirect unauthenticated visitors. Defaults to '/auth/login'.
   */
  redirectPath?: string;
  /**
   * Optional custom children to render instead of `<Outlet />`.
   */
  children?: React.ReactNode;
}

export function ProtectedRoute({
  allowedRoles,
  redirectPath = '/auth/login',
  children,
}: ProtectedRouteProps) {
  const { isAuthenticated, role, isLoading } = useAuth();
  const location = useLocation();

  // Validate redirectPath to prevent open redirects or protocol-relative loops
  const safeRedirectPath =
    redirectPath && redirectPath.startsWith('/') && !redirectPath.startsWith('//')
      ? redirectPath
      : '/auth/login';

  // 1. Loading State: Render accessible loading indicator during initial session rehydration
  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-slate-700"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <span className="text-sm font-medium">Verifying SolveBid session...</span>
      </div>
    );
  }

  // 2. Unauthenticated: Redirect to login, preserving intended path in location state
  if (!isAuthenticated) {
    return <Navigate to={safeRedirectPath} state={{ from: location }} replace />;
  }

  // 3. Role Restriction Check (if specified)
  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    // User is logged in but lacks the required role for this portal.
    // Gracefully redirect to their designated home dashboard:
    if (role === 'CUSTOMER') {
      return <Navigate to="/customer/dashboard" replace />;
    }
    if (role === 'PROFESSIONAL') {
      return <Navigate to="/pro/dashboard" replace />;
    }
    if (role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/auth/login" replace />;
  }

  // 4. Authorized: Render matched child routes
  return children ? <>{children}</> : <Outlet />;
}

