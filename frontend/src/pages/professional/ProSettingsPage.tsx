import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { validateChangePassword } from '@/lib/validation';
import {
  KeyRound,
  Eye,
  EyeOff,
  Bell,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  CheckCircle2,
  AlertCircle,
  X,
  Mail,
  Briefcase,
  ExternalLink,
} from 'lucide-react';

export function ProSettingsPage() {
  const { user, changePassword, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [passwordSubmitError, setPasswordSubmitError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Workbench & Notification Preferences
  const [preferences, setPreferences] = useState({
    dispatchAvailable: true,
    matchingProblemAlerts: true,
    quoteAcceptanceAlerts: true,
    smsUrgentDispatches: true,
  });
  const [preferencesSaved, setPreferencesSaved] = useState(false);

  // Sign out confirmation state
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isVerified = user?.verificationStatus === 'VERIFIED';

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isChangingPassword || authLoading) return;

    const validation = validateChangePassword({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!validation.isValid) {
      setPasswordErrors(validation.errors);
      return;
    }

    setPasswordErrors({});
    setPasswordSubmitError(null);
    setIsChangingPassword(true);

    try {
      await changePassword({ currentPassword, newPassword, confirmPassword });
      setPasswordSuccess('Password successfully updated. Your new credentials are now active.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to change password. Please verify current password.';
      setPasswordSubmitError(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleTogglePreference = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
    setPreferencesSaved(true);
    setTimeout(() => setPreferencesSaved(false), 2500);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Professional Settings & Workbench Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage your contractor security, lead dispatch notifications, and active session controls.
        </p>
      </div>

      {/* Account & Verification Overview Card */}
      <Card className="bg-white border-slate-200/90 shadow-elevated">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-600" />
            Trade Identity & Audit Overview
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Registered business details and platform verification status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Contractor ID</span>
              <span className="font-mono font-medium text-slate-800">{user?.id || 'usr_pro_01'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Registered Email</span>
              <span className="font-medium text-slate-800 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user?.email || 'pro@solvebid.demo'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Verification Audit</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isVerified ? (
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> VERIFIED
                  </span>
                ) : (
                  <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-amber-200">
                    <ShieldAlert className="w-3 h-3 text-amber-600" /> UNVERIFIED
                  </span>
                )}
              </div>
            </div>
          </div>

          {!isVerified && (
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-amber-950">Credential Audit Pending</span>
                <p className="text-amber-800/90 text-[11px]">
                  Your professional registration is pending verification. Submit your trade licenses to begin submitting proposals.
                </p>
              </div>
              <Link
                to="/pro/verification"
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-[11px] font-semibold shrink-0 transition-colors"
              >
                Verification Center <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password Change Card */}
      <Card className="bg-white border-slate-200/90 shadow-elevated">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-600" />
            Change Password
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Update your contractor account password. Requirements: At least 8 characters.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handlePasswordSubmit} noValidate>
          <CardContent className="space-y-4">
            {passwordSuccess && (
              <div
                role="status"
                aria-live="polite"
                className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="flex-1">{passwordSuccess}</span>
                <button
                  type="button"
                  onClick={() => setPasswordSuccess(null)}
                  className="text-emerald-500 hover:text-emerald-800"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {passwordSubmitError && (
              <div
                role="alert"
                aria-live="assertive"
                className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="flex-1">{passwordSubmitError}</span>
                <button
                  type="button"
                  onClick={() => setPasswordSubmitError(null)}
                  className="text-red-500 hover:text-red-800"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Current Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (passwordErrors.currentPassword) {
                      setPasswordErrors({ ...passwordErrors, currentPassword: undefined });
                    }
                  }}
                  error={passwordErrors.currentPassword}
                  disabled={isChangingPassword || authLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                  aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (passwordErrors.newPassword) {
                        setPasswordErrors({ ...passwordErrors, newPassword: undefined });
                      }
                    }}
                    error={passwordErrors.newPassword}
                    disabled={isChangingPassword || authLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                    aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (passwordErrors.confirmPassword) {
                        setPasswordErrors({ ...passwordErrors, confirmPassword: undefined });
                      }
                    }}
                    error={passwordErrors.confirmPassword}
                    disabled={isChangingPassword || authLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-end pt-3 bg-slate-50/50 border-t border-slate-100">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isChangingPassword || authLoading}
              disabled={isChangingPassword || authLoading}
            >
              Update Password
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Dispatch & Workbench Preferences Card */}
      <Card className="bg-white border-slate-200/90 shadow-elevated">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-600" />
                Dispatch & Workbench Notifications
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Configure your job matching notifications and active workbench availability.
              </CardDescription>
            </div>
            {preferencesSaved && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Preferences saved
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-slate-100">
          <div className="py-3 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-900 block">Available for Job Matching</span>
              <p className="text-[11px] text-slate-500">
                When enabled, your business profile is active in the SolveBid matching engine for nearby requests.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleTogglePreference('dispatchAvailable')}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                preferences.dispatchAvailable ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
              aria-label="Toggle job matching availability"
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  preferences.dispatchAvailable ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="py-3 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-900 block">Matching Problem Instant Alerts</span>
              <p className="text-[11px] text-slate-500">
                Receive notifications when new problem reports match your trade category and coverage radius.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleTogglePreference('matchingProblemAlerts')}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                preferences.matchingProblemAlerts ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
              aria-label="Toggle matching problem alerts"
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  preferences.matchingProblemAlerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="py-3 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-900 block">Proposal Acceptance & Job Awards</span>
              <p className="text-[11px] text-slate-500">
                Immediate email & push alert when a customer accepts your proposal and converts it into an active job.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleTogglePreference('quoteAcceptanceAlerts')}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                preferences.quoteAcceptanceAlerts ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
              aria-label="Toggle proposal acceptance alerts"
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  preferences.quoteAcceptanceAlerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Active Session & Logout Card */}
      <Card className="bg-white border-slate-200/90 shadow-elevated">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Session & Security Controls
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Terminate your active contractor session and clear local credentials.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <span className="font-semibold text-slate-800 block">Session Details</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Active in mock contractor mode. Passwords and sensitive credentials are isolated in memory and never stored in plaintext. Logging out revokes your active token and redirects to the sign-in portal.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-3 bg-slate-50/50 border-t border-slate-100">
          <span className="text-xs text-slate-500">Sign out of contractor workbench?</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLogout}
            isLoading={isLoggingOut}
            leftIcon={<LogOut className="w-3.5 h-3.5 text-red-600" />}
            className="text-red-700 hover:bg-red-50 hover:border-red-200"
          >
            Sign Out of Account
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
