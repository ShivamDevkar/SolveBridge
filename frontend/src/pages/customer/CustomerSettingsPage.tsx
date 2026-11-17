import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  LogOut,
  CheckCircle2,
  AlertCircle,
  X,
  Mail,
  User,
} from 'lucide-react';

export function CustomerSettingsPage() {
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

  // Mock Notification Preferences
  const [preferences, setPreferences] = useState({
    proposalAlerts: true,
    jobUpdates: true,
    smsAlerts: false,
    marketingEmails: false,
  });
  const [preferencesSaved, setPreferencesSaved] = useState(false);

  // Sign out confirmation state
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
          Account Settings & Security
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage your credentials, notification channels, and active marketplace session.
        </p>
      </div>

      {/* Account Overview Card */}
      <Card className="bg-white border-slate-200/90 shadow-elevated">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            Account Overview
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Current account identity and session profile information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">User ID</span>
              <span className="font-mono font-medium text-slate-800">{user?.id || 'usr_customer_01'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Primary Email</span>
              <span className="font-medium text-slate-800 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user?.email || 'customer@solvebid.demo'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Account Role</span>
              <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-0.5 border border-blue-200">
                {user?.role || 'CUSTOMER'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Card */}
      <Card className="bg-white border-slate-200/90 shadow-elevated">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-blue-600" />
            Change Password
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Update your account password. Requirements: At least 8 characters.
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

      {/* Notification Preferences Card */}
      <Card className="bg-white border-slate-200/90 shadow-elevated">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                Notification Preferences
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Choose what communications and alerts you receive from SolveBid.
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
              <span className="text-xs font-semibold text-slate-900 block">Proposal Notifications</span>
              <p className="text-[11px] text-slate-500">
                Receive instant email alerts whenever a professional bids or posts a proposal for your problem.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleTogglePreference('proposalAlerts')}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                preferences.proposalAlerts ? 'bg-blue-600' : 'bg-slate-300'
              }`}
              aria-label="Toggle proposal notifications"
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  preferences.proposalAlerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="py-3 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-900 block">Job Workspace Activity</span>
              <p className="text-[11px] text-slate-500">
                Alerts on professional arrival confirmation, quote revisions, and completion milestone sign-offs.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleTogglePreference('jobUpdates')}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                preferences.jobUpdates ? 'bg-blue-600' : 'bg-slate-300'
              }`}
              aria-label="Toggle job updates"
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  preferences.jobUpdates ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="py-3 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-900 block">SMS Milestone Updates</span>
              <p className="text-[11px] text-slate-500">
                Direct SMS text messages when a professional is en route or at your premises.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleTogglePreference('smsAlerts')}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                preferences.smsAlerts ? 'bg-blue-600' : 'bg-slate-300'
              }`}
              aria-label="Toggle SMS alerts"
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  preferences.smsAlerts ? 'translate-x-5' : 'translate-x-0'
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
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Session & Security Controls
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Terminate your active session and remove stored credentials from this browser.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <span className="font-semibold text-slate-800 block">Session Details</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              This session is running in isolated development mode. Sensitive credentials are never persisted to storage, and passwords are not stored in plaintext. Logging out terminates your session and redirects you to the authentication gateway.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-3 bg-slate-50/50 border-t border-slate-100">
          <span className="text-xs text-slate-500">Ready to conclude your session?</span>
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
