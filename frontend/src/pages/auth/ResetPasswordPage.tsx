import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { validateResetPasswordFields } from '@/lib/validation';
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  KeyRound,
  X,
  ShieldCheck,
} from 'lucide-react';

export function ResetPasswordPage() {
  const location = useLocation();
  const { validateResetToken, resetPassword, isLoading: authLoading } = useAuth();

  // Retrieve transient token from router state (never stored in localStorage or URL query parameters)
  const locationState = location.state as { token?: string; email?: string } | undefined;
  const token = locationState?.token;
  const associatedEmail = locationState?.email;

  const [tokenStatus, setTokenStatus] = useState<{
    isChecking: boolean;
    isValid: boolean;
    error?: string;
  }>({
    isChecking: true,
    isValid: false,
  });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validate the reset token on mount
  useEffect(() => {
    let isMounted = true;

    async function checkToken() {
      if (!token || typeof token !== 'string' || token.trim() === '') {
        if (isMounted) {
          setTokenStatus({
            isChecking: false,
            isValid: false,
            error: 'No security token found. Password reset requests require a valid, non-expired recovery token.',
          });
        }
        return;
      }

      try {
        const result = await validateResetToken(token);
        if (isMounted) {
          setTokenStatus({
            isChecking: false,
            isValid: result.valid,
            error: result.error,
          });
        }
      } catch (err) {
        if (isMounted) {
          setTokenStatus({
            isChecking: false,
            isValid: false,
            error: 'Failed to validate reset token. Please request a new recovery link.',
          });
        }
      }
    }

    checkToken();

    return () => {
      isMounted = false;
    };
  }, [token, validateResetToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || authLoading || !token || !tokenStatus.isValid) return;

    const validation = validateResetPasswordFields({
      password: newPassword,
      confirmPassword,
    });

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setFieldErrors({});
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await resetPassword({
        token,
        newPassword,
        confirmPassword,
      });

      setIsSuccess(true);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to reset password. The link may have expired or was already used.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white border-slate-200/90 shadow-elevated">
      <CardHeader>
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 shadow-2xs border border-blue-100">
          <KeyRound className="w-5 h-5" />
        </div>
        <CardTitle className="text-xl sm:text-2xl text-slate-900 font-bold">
          Create New Password
        </CardTitle>
        <CardDescription className="text-slate-600 text-xs sm:text-sm">
          {associatedEmail ? (
            <span>Setting new access credentials for <strong className="text-slate-800">{associatedEmail}</strong>.</span>
          ) : (
            <span>Choose a secure password of at least 8 characters.</span>
          )}
        </CardDescription>
      </CardHeader>

      {/* 1. Successful Reset Card */}
      {isSuccess ? (
        <CardContent className="space-y-4 py-4">
          <div className="p-6 text-center space-y-3 bg-emerald-50/60 rounded-2xl border border-emerald-200">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                Password Successfully Reset
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                Your new password has been applied. The single-use recovery token has been invalidated. You can now proceed to log in with your updated credentials.
              </p>
            </div>

            <div className="pt-2">
              <Link to="/auth/login" className="w-full block">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full font-bold shadow-sm"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Proceed to Sign In
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      ) : tokenStatus.isChecking ? (
        /* 2. Checking Token State */
        <CardContent className="py-8 text-center space-y-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Verifying password reset token...</p>
        </CardContent>
      ) : !tokenStatus.isValid ? (
        /* 3. Invalid / Missing / Expired Token State */
        <CardContent className="space-y-4 py-2">
          <div
            role="alert"
            aria-live="assertive"
            className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2 shadow-2xs"
          >
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Invalid or Expired Reset Link</span>
            </div>
            <p className="text-amber-900/90 leading-relaxed pl-6">
              {tokenStatus.error ||
                'This password recovery request lacks a valid security token, has already been used, or has expired (tokens are valid for 15 minutes).'}
            </p>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            For account protection, password reset links are single-use and time-limited. Please request a new recovery link to continue.
          </p>

          <div className="pt-1 flex flex-col gap-2">
            <Link to="/auth/forgot-password" className="w-full">
              <Button
                variant="primary"
                size="md"
                className="w-full font-bold"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Request New Reset Link
              </Button>
            </Link>

            <div className="pt-2 text-center">
              <Link
                to="/auth/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </div>
        </CardContent>
      ) : (
        /* 4. Active Reset Password Form */
        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="space-y-4">
            {/* Submission Error Banner */}
            {submitError && (
              <div
                role="alert"
                aria-live="assertive"
                className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5 shadow-2xs"
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold block text-[11px] uppercase tracking-wider text-red-900">
                    Reset Failed
                  </span>
                  <p className="text-red-700 mt-0.5 leading-relaxed">{submitError}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitError(null)}
                  aria-label="Dismiss error notification"
                  className="text-red-400 hover:text-red-700 p-0.5 rounded transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Token Valid Banner */}
            <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Simulated recovery token validated. You may now specify your new password.</span>
            </div>

            {/* New Password Input */}
            <div className="space-y-1">
              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="pointer-events-auto text-slate-400 hover:text-slate-600 focus:outline-hidden p-0.5 cursor-pointer"
                    tabIndex={0}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  if (submitError) setSubmitError(null);
                }}
                error={fieldErrors.password}
                required
                disabled={isSubmitting || authLoading}
              />
            </div>

            {/* Confirm New Password Input */}
            <div className="space-y-1">
              <Input
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repeat new password"
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}
                    className="pointer-events-auto text-slate-400 hover:text-slate-600 focus:outline-hidden p-0.5 cursor-pointer"
                    tabIndex={0}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) {
                    setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }
                  if (submitError) setSubmitError(null);
                }}
                error={fieldErrors.confirmPassword}
                required
                disabled={isSubmitting || authLoading}
              />
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-3 pt-2">
            <Button
              type="submit"
              size="lg"
              isLoading={isSubmitting || authLoading}
              disabled={isSubmitting || authLoading}
              className="w-full font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Update Password
            </Button>

            <div className="flex items-center justify-center pt-1">
              <Link
                to="/auth/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cancel and Return to Sign In</span>
              </Link>
            </div>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
