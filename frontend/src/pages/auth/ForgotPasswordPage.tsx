import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { validateForgotPasswordFields } from '@/lib/validation';
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  X,
  Info,
} from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState<string | undefined>(undefined);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedState, setSubmittedState] = useState<{
    submitted: boolean;
    genericMessage: string;
    mockResetToken?: string;
    submittedEmail: string;
  } | null>(null);

  const { requestPasswordReset, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || authLoading) return;

    const validation = validateForgotPasswordFields({ email });
    if (!validation.isValid) {
      setFieldError(validation.errors.email);
      return;
    }

    setFieldError(undefined);
    setAuthError(null);
    setIsSubmitting(true);

    try {
      const result = await requestPasswordReset(email);
      setSubmittedState({
        submitted: true,
        genericMessage: result.message,
        mockResetToken: result.mockResetToken,
        submittedEmail: email.trim(),
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to process password recovery request. Please try again.';
      setAuthError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProceedToReset = () => {
    if (!submittedState?.mockResetToken) return;

    // Transient navigation handoff via router state (never persisted to storage or URL query parameters)
    navigate('/auth/reset-password', {
      state: {
        token: submittedState.mockResetToken,
        email: submittedState.submittedEmail,
      },
    });
  };

  const handleResetForm = () => {
    setSubmittedState(null);
    setEmail('');
    setFieldError(undefined);
    setAuthError(null);
  };

  return (
    <Card className="bg-white border-slate-200/90 shadow-elevated">
      <CardHeader>
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 shadow-2xs border border-blue-100">
          <KeyRound className="w-5 h-5" />
        </div>
        <CardTitle className="text-xl sm:text-2xl text-slate-900 font-bold">
          Reset Your Password
        </CardTitle>
        <CardDescription className="text-slate-600 text-xs sm:text-sm">
          Enter your registered email address and we will initiate the password recovery process.
        </CardDescription>
      </CardHeader>

      {submittedState?.submitted ? (
        <CardContent className="space-y-4 py-2">
          {/* 1. Generic Privacy-Conscious Confirmation Notice */}
          <div
            role="status"
            aria-live="polite"
            className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-950 space-y-1.5 shadow-2xs"
          >
            <div className="flex items-center gap-2 font-bold text-blue-900">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Recovery Request Submitted</span>
            </div>
            <p className="text-blue-900/90 leading-relaxed pl-6">
              {submittedState.genericMessage}
            </p>
          </div>

          {/* 2. Development Prototype Simulation Guidance */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <Info className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Development Simulation Note</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              In this client-side prototype, live outbound email dispatch is simulated.
              {submittedState.mockResetToken ? (
                <span>
                  {' '}A temporary simulated recovery token has been generated for your account. You can proceed directly to create a new password.
                </span>
              ) : (
                <span>
                  {' '}No account associated with <strong className="text-slate-700">{submittedState.submittedEmail}</strong> exists in the in-memory or seed registry. For demonstration, you may try a demo account (e.g. <em>customer@solvebid.demo</em>).
                </span>
              )}
            </p>

            {submittedState.mockResetToken ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleProceedToReset}
                className="w-full font-bold mt-2"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Proceed to Set New Password
              </Button>
            ) : (
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={handleResetForm}
                className="w-full text-xs font-semibold mt-2"
              >
                Try Another Email Address
              </Button>
            )}
          </div>

          <div className="pt-2 text-center">
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Sign In</span>
            </Link>
          </div>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="space-y-4">
            {/* Error Notification Banner */}
            {authError && (
              <div
                role="alert"
                aria-live="assertive"
                className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5 shadow-2xs"
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold block text-[11px] uppercase tracking-wider text-red-900">
                    Request Failed
                  </span>
                  <p className="text-red-700 mt-0.5 leading-relaxed">{authError}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAuthError(null)}
                  aria-label="Dismiss error notice"
                  className="text-red-400 hover:text-red-700 p-0.5 rounded transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="space-y-1.5">
              <Input
                label="Registered Email Address"
                type="email"
                placeholder="name@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldError) setFieldError(undefined);
                  if (authError) setAuthError(null);
                }}
                error={fieldError}
                required
                disabled={isSubmitting || authLoading}
              />
              <p className="text-[11px] text-slate-500 leading-relaxed px-0.5">
                We will verify your email against active demonstration accounts (e.g. <em>customer@solvebid.demo</em>, <em>pro.hvac@solvebid.demo</em>) or accounts registered during this session.
              </p>
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
              Send Recovery Instructions
            </Button>

            <div className="flex items-center justify-center pt-1">
              <Link
                to="/auth/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}

