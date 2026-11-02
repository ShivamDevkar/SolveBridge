import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { UserRole } from '@/types/common';
import { SessionPersistence } from '@/types/auth';
import { useAuth } from '@/context/AuthContext';
import { validateLoginFields } from '@/lib/validation';
import {
  Lock,
  Mail,
  ArrowRight,
  User,
  Briefcase,
  ShieldCheck,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  X,
} from 'lucide-react';

interface PortalOptionConfig {
  role: UserRole;
  title: string;
  portalLabel: string;
  description: string;
  demoEmail: string;
  icon: typeof User;
  colors: {
    borderSelected: string;
    bgSelected: string;
    ringSelected: string;
    iconSelected: string;
    textSelected: string;
    badgeSelected: string;
    radioSelected: string;
    buttonBg: string;
  };
}

const PORTALS: PortalOptionConfig[] = [
  {
    role: 'CUSTOMER',
    title: 'Customer',
    portalLabel: 'Customer Portal',
    description: 'Describe problems, compare proposals, and manage jobs.',
    demoEmail: 'customer@solvebid.demo',
    icon: User,
    colors: {
      borderSelected: 'border-blue-600',
      bgSelected: 'bg-blue-50/70',
      ringSelected: 'ring-2 ring-blue-500/20',
      iconSelected: 'bg-blue-100 text-blue-700',
      textSelected: 'text-blue-900',
      badgeSelected: 'bg-blue-100 text-blue-700 border-blue-200',
      radioSelected: 'border-blue-600 bg-blue-600 text-white',
      buttonBg: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
  },
  {
    role: 'PROFESSIONAL',
    title: 'Professional',
    portalLabel: 'Professional Workbench',
    description: 'Explore matching opportunities, submit proposals, and manage work.',
    demoEmail: 'pro.hvac@solvebid.demo',
    icon: Briefcase,
    colors: {
      borderSelected: 'border-amber-600',
      bgSelected: 'bg-amber-50/70',
      ringSelected: 'ring-2 ring-amber-500/20',
      iconSelected: 'bg-amber-100 text-amber-800',
      textSelected: 'text-amber-950',
      badgeSelected: 'bg-amber-100 text-amber-800 border-amber-200',
      radioSelected: 'border-amber-600 bg-amber-600 text-white',
      buttonBg: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
  },
  {
    role: 'ADMIN',
    title: 'Admin',
    portalLabel: 'Admin Console',
    description: 'Manage verification, disputes, and marketplace operations.',
    demoEmail: 'admin@solvebid.demo',
    icon: ShieldCheck,
    colors: {
      borderSelected: 'border-purple-600',
      bgSelected: 'bg-purple-50/70',
      ringSelected: 'ring-2 ring-purple-500/20',
      iconSelected: 'bg-purple-100 text-purple-800',
      textSelected: 'text-purple-950',
      badgeSelected: 'bg-purple-100 text-purple-800 border-purple-200',
      radioSelected: 'border-purple-600 bg-purple-600 text-white',
      buttonBg: 'bg-purple-600 hover:bg-purple-700 text-white',
    },
  },
];

/**
 * Validates intended return destination against the authenticated user's role.
 * Prevents unauthorized cross-role redirects and external open redirects.
 */
function getSafeRedirectUrl(targetPath: string | undefined, authenticatedRole: UserRole): string {
  const defaultDashboard =
    authenticatedRole === 'CUSTOMER'
      ? '/customer/dashboard'
      : authenticatedRole === 'PROFESSIONAL'
      ? '/pro/dashboard'
      : '/admin/dashboard';

  if (!targetPath || typeof targetPath !== 'string') {
    return defaultDashboard;
  }

  // Prevent external or protocol-relative open redirects, or looping auth redirects
  if (!targetPath.startsWith('/') || targetPath.startsWith('//') || targetPath.startsWith('/auth')) {
    return defaultDashboard;
  }

  // Role validation: ensure path is authorized for this role or is the shared job workspace
  if (authenticatedRole === 'CUSTOMER') {
    if (targetPath.startsWith('/customer') || targetPath.startsWith('/jobs')) {
      return targetPath;
    }
  } else if (authenticatedRole === 'PROFESSIONAL') {
    if (targetPath.startsWith('/pro') || targetPath.startsWith('/jobs')) {
      return targetPath;
    }
  } else if (authenticatedRole === 'ADMIN') {
    if (targetPath.startsWith('/admin') || targetPath.startsWith('/jobs')) {
      return targetPath;
    }
  }

  return defaultDashboard;
}

export function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('CUSTOMER');
  const [email, setEmail] = useState('customer@solvebid.demo');
  const [password, setPassword] = useState('demo1234');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, role: userRole, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect already authenticated users away from login to their role dashboard
  useEffect(() => {
    if (isAuthenticated && !authLoading && userRole) {
      const defaultDashboard =
        userRole === 'CUSTOMER'
          ? '/customer/dashboard'
          : userRole === 'PROFESSIONAL'
          ? '/pro/dashboard'
          : '/admin/dashboard';
      navigate(defaultDashboard, { replace: true });
    }
  }, [isAuthenticated, authLoading, userRole, navigate]);

  const activePortal = PORTALS.find((p) => p.role === selectedRole) || PORTALS[0];

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setFieldErrors({});
    setAuthError(null);
    const target = PORTALS.find((p) => p.role === role);
    if (target) {
      setEmail(target.demoEmail);
      setPassword('demo1234');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Prevent duplicate submission
    if (isSubmitting || authLoading) return;

    // 2. Validate form fields
    const validation = validateLoginFields({ email, password });
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setFieldErrors({});
    setAuthError(null);
    setIsSubmitting(true);

    const persistence: SessionPersistence = rememberMe ? 'local' : 'session';

    try {
      // 3. Authenticate via context action
      const result = await login(
        {
          email,
          password,
          role: selectedRole,
          rememberMe,
        },
        persistence
      );

      // 4. Role-aware redirection with protected-route return destination support
      const locationState = location.state as { from?: { pathname: string } } | undefined;
      const targetDestination = locationState?.from?.pathname;
      const safeUrl = getSafeRedirectUrl(targetDestination, result.user.role);

      navigate(safeUrl, { replace: true });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to sign in. Please verify your credentials and selected portal.';
      setAuthError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white border-slate-200/90 shadow-elevated">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl text-slate-900 font-bold">Sign In to SolveBid</CardTitle>
        <CardDescription className="text-slate-600 text-xs sm:text-sm">
          Select your portal to access tailored tools and marketplace workflows.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleLogin} noValidate>
        <CardContent className="space-y-5">
          {/* 3 Prominent Selectable Portal Options */}
          <div className="space-y-2.5">
            <span className="block text-xs font-bold text-slate-800">
              Choose Your Portal
            </span>

            <div
              className="space-y-2.5"
              role="radiogroup"
              aria-label="Select SolveBid Marketplace Portal"
            >
              {PORTALS.map((portal) => {
                const isSelected = selectedRole === portal.role;
                const IconComponent = portal.icon;

                return (
                  <button
                    key={portal.role}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleRoleChange(portal.role)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 ${
                      isSelected
                        ? `border-2 ${portal.colors.borderSelected} ${portal.colors.bgSelected} ${portal.colors.ringSelected} shadow-xs`
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Role Icon */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? portal.colors.iconSelected
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>

                      {/* Role Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-sm ${isSelected ? portal.colors.textSelected : 'text-slate-900'}`}>
                              {portal.title}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${
                                isSelected
                                  ? portal.colors.badgeSelected
                                  : 'bg-slate-50 text-slate-500 border-slate-200'
                              }`}
                            >
                              {portal.portalLabel}
                            </span>
                          </div>

                          {/* Selected Radio / Check Indicator */}
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? portal.colors.radioSelected
                                : 'border border-slate-300 bg-white'
                            }`}
                            aria-hidden="true"
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {portal.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Authentication Failure Error Banner */}
          {authError && (
            <div
              role="alert"
              aria-live="assertive"
              className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5 shadow-2xs"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block text-[11px] uppercase tracking-wider text-red-900">
                  Authentication Failed
                </span>
                <p className="text-red-700 mt-0.5 leading-relaxed">{authError}</p>
              </div>
              <button
                type="button"
                onClick={() => setAuthError(null)}
                aria-label="Dismiss error notification"
                className="text-red-400 hover:text-red-700 p-0.5 rounded transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Form Credentials Section */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                if (authError) setAuthError(null);
              }}
              leftIcon={<Mail className="w-4 h-4" />}
              error={fieldErrors.email}
              required
              disabled={isSubmitting || authLoading}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                if (authError) setAuthError(null);
              }}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="pointer-events-auto text-slate-400 hover:text-slate-600 focus:outline-hidden p-0.5 cursor-pointer"
                  tabIndex={0}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              error={fieldErrors.password}
              required
              disabled={isSubmitting || authLoading}
            />
          </div>

          {/* Development Prototype Demonstration Notice */}
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block animate-pulse" />
              <span>Development Demo: Seed credentials for {activePortal.title}</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              demo1234
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                disabled={isSubmitting || authLoading}
              />
              <span>Remember this session</span>
            </label>
            <Link to="/auth/forgot-password" className="text-blue-600 hover:underline font-medium">
              Forgot password?
            </Link>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-3">
          {/* Role-Specific Primary CTA with Loading Spinner */}
          <Button
            type="submit"
            size="lg"
            isLoading={isSubmitting || authLoading}
            disabled={isSubmitting || authLoading}
            className={`w-full font-bold shadow-sm transition-all ${activePortal.colors.buttonBg}`}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Continue as {activePortal.title}
          </Button>

          <p className="text-xs text-slate-500 text-center">
            Don't have an account?{' '}
            <Link to="/auth/register" className="text-blue-600 hover:underline font-semibold">
              Create an account
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
