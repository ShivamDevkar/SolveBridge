import { Link, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  LayoutDashboard,
  Building2,
  Briefcase,
} from 'lucide-react';

export function ProRegistrationSuccessPage() {
  const { user } = useAuth();
  const location = useLocation();
  const locationState = location.state as {
    businessName?: string;
    category?: string;
    newProEmail?: string;
  } | undefined;

  const displayName = locationState?.businessName || user?.name || 'Professional Partner';

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4 space-y-6">
      {/* 1. Header & Welcome Card */}
      <Card className="bg-white border-slate-200/90 shadow-elevated overflow-hidden">
        <div className="h-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-blue-600" />
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-amber-800 tracking-wider uppercase">
                Professional Onboarding
              </span>
            </div>
            {/* Status Pill */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs self-start sm:self-auto">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Status: UNVERIFIED</span>
            </span>
          </div>

          <CardTitle className="text-2xl sm:text-3xl font-bold text-slate-900">
            Welcome, {displayName}!
          </CardTitle>
          <CardDescription className="text-slate-600 text-sm leading-relaxed mt-1">
            Your professional service provider account has been initialized on SolveBid.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 2. Prominent Pending-Verification Notice Box */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/90 text-amber-900 text-xs sm:text-sm space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Important Verification Policy</span>
            </div>
            <p className="text-xs text-amber-900/90 leading-relaxed pl-6">
              Your account is currently <strong>UNVERIFIED</strong>. You can complete your profile and explore the workbench while your account is awaiting review. In accordance with SolveBid quality standards, submitting proposals on active customer problems requires verified credentials.
            </p>
          </div>

          {/* 3. Four-Stage Verification Journey */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Verification Roadmap & Milestones
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Stage 1 */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2 relative shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      1
                    </span>
                    <span className="font-bold text-sm text-slate-900">Account Created</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Complete</span>
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your Professional account has been successfully created. You have immediate access to your workbench settings and coverage preferences.
                </p>
              </div>

              {/* Stage 2 */}
              <div className="p-4 rounded-xl border-2 border-blue-500 bg-blue-50/50 space-y-2 relative shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                      2
                    </span>
                    <span className="font-bold text-sm text-blue-950">Document Upload</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    Action Required
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  You must upload the required verification documents (Government ID, trade licenses, certifications, insurance) through the verification section.
                </p>
              </div>

              {/* Stage 3 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
                      3
                    </span>
                    <span className="font-bold text-sm text-slate-800">Admin Review</span>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Upcoming</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your submitted documents will be reviewed by the SolveBid administration team to verify trade qualifications and background standards.
                </p>
              </div>

              {/* Stage 4 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
                      4
                    </span>
                    <span className="font-bold text-sm text-slate-800">Verified Professional</span>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Goal</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  After successful verification, your account can receive verified status and become eligible for professional proposal-related functionality, subject to actual backend rules.
                </p>
              </div>
            </div>
          </div>

          {/* 4. Quick Account Summary */}
          {locationState?.category && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs space-y-1.5">
              <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                Registration Summary
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200/70 text-slate-600">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>Category: <strong className="text-slate-900">{locationState.category}</strong></span>
                </div>
                {locationState.newProEmail && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-xs">@</span>
                    <span>Account: <strong className="text-slate-900">{locationState.newProEmail}</strong></span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>

        {/* 5. Clear Call to Actions */}
        <CardFooter className="pt-2 pb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100">
          <Link to="/pro/dashboard" className="order-2 sm:order-1">
            <Button
              variant="outline"
              size="md"
              className="w-full sm:w-auto text-xs font-semibold"
              leftIcon={<LayoutDashboard className="w-4 h-4" />}
            >
              Explore Workbench Dashboard
            </Button>
          </Link>

          <Link to="/pro/verification" className="order-1 sm:order-2">
            <Button
              variant="primary"
              size="md"
              className="w-full sm:w-auto font-bold shadow-sm bg-blue-600 hover:bg-blue-700 text-white text-xs"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Upload Verification Documents
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
