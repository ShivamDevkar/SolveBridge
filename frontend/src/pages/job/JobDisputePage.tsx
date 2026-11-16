import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { mockDisputeAdapter } from '@/services/mockDisputeAdapter';
import type { JobWorkspaceContextType } from '@/layouts/JobWorkspaceLayout';
import type { Dispute, DisputeCategory, DisputeStatus } from '@/types/dispute';
import {
  ShieldAlert,
  Gavel,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  FileText,
  Eye,
  MessageSquare,
} from 'lucide-react';

const DISPUTE_CATEGORIES: { value: DisputeCategory; label: string }[] = [
  { value: 'SERVICE_QUALITY', label: 'Service Quality Defect' },
  { value: 'INCOMPLETE_WORK', label: 'Incomplete or Abandoned Work' },
  { value: 'BILLING_DISAGREEMENT', label: 'Billing / Overcharging Dispute' },
  { value: 'PROPERTY_DAMAGE', label: 'Property Damage on Site' },
  { value: 'UNPROFESSIONAL_BEHAVIOR', label: 'Unprofessional Conduct' },
  { value: 'UNAUTHORIZED_CHARGE', label: 'Unauthorized Work / Added Charges' },
];

export function JobDisputePage() {
  const { job, refreshJob } = useOutletContext<JobWorkspaceContextType>();
  const { user, role } = useAuth();

  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dispute form state (Customer)
  const [category, setCategory] = useState<DisputeCategory>('SERVICE_QUALITY');
  const [title, setTitle] = useState('');
  const [complaint, setComplaint] = useState('');
  const [disputedAmount, setDisputedAmount] = useState<number>(job?.currentAmount || 1000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  if (!job) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p className="text-sm">Loading job workspace...</p>
      </div>
    );
  }

  const isCustomer = role === 'CUSTOMER';
  const isAdmin = role === 'ADMIN';

  const loadDispute = async () => {
    if (!job?.id) return;
    setIsLoading(true);
    try {
      const found = await mockDisputeAdapter.getDisputeByJobId(job.id);
      setDispute(found);
      if (found) {
        setDisputedAmount(found.disputedAmount);
      } else {
        setDisputedAmount(job.currentAmount);
      }
    } catch (err) {
      console.error('Failed to load dispute for job:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDispute();
  }, [job?.id]);

  const handleOpenDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (title.trim().length < 5) {
      setFormError('Please provide a descriptive dispute title (at least 5 characters).');
      return;
    }
    if (complaint.trim().length < 10) {
      setFormError('Please state the details of your grievance (at least 10 characters).');
      return;
    }
    if (disputedAmount <= 0) {
      setFormError('Disputed amount must be greater than zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await mockDisputeAdapter.createDispute(
        {
          jobId: job.id,
          category,
          title: title.trim(),
          customerComplaint: complaint.trim(),
          disputedAmount,
        },
        {
          id: user?.id || 'user-demo-customer',
          name: user?.name || 'Customer Complainant',
        }
      );
      setDispute(created);
      setSuccessBanner(`Dispute #${created.id} has been opened and submitted to platform arbitrators.`);
      await refreshJob();
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit dispute claim.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: DisputeStatus) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            Open Dispute • Awaiting Review
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            Under Administrative Review
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Arbitration Resolved
          </span>
        );
      case 'DISMISSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
            Claim Dismissed
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-3">
        <Clock className="w-8 h-8 text-red-600 animate-spin mx-auto" />
        <p className="text-sm font-medium">Checking dispute registry for Job #{job?.id}...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Success Notification */}
      {successBanner && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-emerald-700 font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* DISPUTE EXISTS VIEW */}
      {dispute ? (
        <div className="space-y-6">
          {/* Dispute Overview Card */}
          <Card className="border-red-200 shadow-sm overflow-hidden">
            <div className="h-2 bg-red-600" />
            <CardHeader className="bg-red-50/50 pb-4 border-b border-red-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-red-700 bg-red-100/70 border border-red-200 px-2 py-0.5 rounded">
                      {dispute.id}
                    </span>
                    {getStatusBadge(dispute.status)}
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-900">{dispute.title}</CardTitle>
                  <CardDescription className="text-xs">
                    Filed on {new Date(dispute.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </CardDescription>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[11px] text-slate-500 block">Disputed Financial Amount</span>
                  <span className="text-lg font-bold text-red-700 font-mono">
                    ₹{dispute.disputedAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              {/* Customer Complaint Statement */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-red-600" />
                  Customer Complaint ({dispute.customerName})
                </span>
                <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                  {dispute.customerComplaint}
                </p>
              </div>

              {/* Professional Technical Response */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1.5">
                <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Gavel className="w-3.5 h-3.5 text-blue-600" />
                  Professional Response ({dispute.professionalName})
                </span>
                {dispute.professionalResponse ? (
                  <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                    {dispute.professionalResponse}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    The professional has been notified and is preparing an official technical statement for administrative review.
                  </p>
                )}
              </div>

              {/* RULING BANNER (If Closed/Resolved) */}
              {dispute.arbitrationDecision && (
                <div className="p-5 rounded-xl bg-emerald-50 border-2 border-emerald-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Binding Administrative Arbitration Ruling
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {dispute.arbitrationDecision.decision.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed">
                    <strong>Adjudication Statement:</strong> {dispute.arbitrationDecision.explanation}
                  </p>
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-emerald-100 flex items-center justify-between">
                    <span>Arbitrated by: <strong>{dispute.arbitrationDecision.arbitratorName}</strong></span>
                    <span>
                      {new Date(dispute.arbitrationDecision.resolvedAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                </div>
              )}

              {/* Admin Link */}
              {isAdmin && (
                <div className="pt-2 flex justify-end">
                  <Link to={`/admin/disputes/${dispute.id}`}>
                    <Button variant="primary" size="sm" className="bg-red-600 hover:bg-red-700 text-white text-xs">
                      Inspect in Admin Disputes Center
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : isCustomer ? (
        /* NO DISPUTE YET - CUSTOMER GRIEVANCE SUBMISSION FORM */
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              Open a Formal Job Dispute
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              If service was incomplete, defective, or overcharged, and could not be resolved via chat, open a dispute for platform administrative arbitration.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleOpenDispute} className="space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Dispute Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Grievance Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DisputeCategory)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                >
                  {DISPUTE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dispute Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dispute Summary Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Cooling failed completely 24 hours after repair"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>

              {/* Detailed Complaint */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Grievance Description <span className="text-red-500">*</span> (min 10 characters)
                </label>
                <textarea
                  rows={4}
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  placeholder="Describe exactly what occurred, what parts were replaced or left undone, and why the service failed to meet expectations..."
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
                <span className="text-[11px] text-slate-400">{complaint.trim().length}/10 characters minimum</span>
              </div>

              {/* Disputed Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Disputed Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={disputedAmount}
                  onChange={(e) => setDisputedAmount(Number(e.target.value))}
                  className="w-full sm:w-48 px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
                <span className="text-[11px] text-slate-400 block mt-0.5">Total job value: ₹{job.currentAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting || title.trim().length < 5 || complaint.trim().length < 10}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-5 py-2 flex items-center gap-1.5"
                >
                  <Gavel className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Opening Dispute...' : 'Submit Formal Dispute Claim'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        /* PROFESSIONAL VIEW WHEN NO DISPUTE */
        <Card className="border-slate-200 p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Disputes on Job #{job.id}</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            This engagement has no open conflicts or arbitration claims. Continue coordinating directly with your customer via the live chat channel.
          </p>
          <div className="pt-2">
            <Link to={`/jobs/${job.id}/chat`}>
              <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5 mx-auto text-blue-700 border-blue-200">
                <MessageSquare className="w-3.5 h-3.5" />
                Go to Live Chat
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
