import { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { mockJobAdapter } from '@/services/mockJobAdapter';
import type { JobWorkspaceContextType } from '@/layouts/JobWorkspaceLayout';
import {
  ClipboardCheck,
  CheckCircle2,
  ShieldCheck,
  Wrench,
} from 'lucide-react';

export function JobCompletionPage() {
  const { job, refreshJob } = useOutletContext<JobWorkspaceContextType>();
  const { user, role } = useAuth();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  if (!job) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p className="text-sm">Loading job workspace...</p>
      </div>
    );
  }

  const isCustomer = role === 'CUSTOMER';
  const isCompleted = job.status === 'COMPLETED';
  const isConfirmed = job.status === 'CUSTOMER_CONFIRMED' || job.status === 'CLOSED';

  const handleConfirmCompletion = async () => {
    if (!job?.id) return;
    setIsSubmitting(true);
    try {
      await mockJobAdapter.confirmJobCompletion(
        job.id,
        {
          id: user?.id || 'user-demo-customer',
          name: user?.name || 'Customer Confirmer',
          role: 'CUSTOMER',
        },
        feedbackNote.trim() || undefined
      );
      await refreshJob();
      setIsConfirmModalOpen(false);
      setSuccessBanner('Job completion successfully confirmed! The service engagement has been verified.');
    } catch (err: any) {
      alert(err.message || 'Failed to confirm job completion.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

      {/* Main Status Header Card */}
      <Card className="border-slate-200 overflow-hidden shadow-xs">
        <div
          className={`h-2 ${
            isConfirmed ? 'bg-emerald-600' : isCompleted ? 'bg-orange-500' : 'bg-blue-600'
          }`}
        />
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Accountability Sign-Off Gate
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    isConfirmed
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : isCompleted
                      ? 'bg-orange-50 text-orange-700 border-orange-200 animate-pulse'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  {job.status.replace(/_/g, ' ')}
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">
                {isConfirmed
                  ? 'Service Completed & Customer Confirmed'
                  : isCompleted
                  ? 'Work Complete • Pending Customer Sign-Off'
                  : 'Service Execution In Progress'}
              </h1>
              <p className="text-xs text-slate-600 max-w-xl">
                {isConfirmed
                  ? 'All deliverables have been formally verified. This engagement is confirmed in platform records.'
                  : isCompleted
                  ? 'The professional has finished work on-site and submitted completion evidence. The customer must inspect the work and confirm.'
                  : 'A job cannot be closed unilaterally by the professional. Completion evidence and customer sign-off unlock once work is completed.'}
              </p>
            </div>

            {isCompleted && isCustomer && (
              <div className="shrink-0">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsConfirmModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2.5 flex items-center gap-2 shadow-2xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm Completion
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Completion Details & Evidence */}
      {job.completionDetails ? (
        <div className="space-y-4">
          <Card className="border-slate-200">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-emerald-600" />
                Submitted Completion Deliverables
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Work Summary & Diagnosis
                </span>
                <p className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-slate-800 leading-relaxed font-sans">
                  {job.completionDetails.workDone || 'Diagnostic and repair procedure completed per approved scope.'}
                </p>
              </div>

              {job.completionDetails.notes && (
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Contractor Advice & Operating Instructions
                  </span>
                  <p className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed italic">
                    "{job.completionDetails.notes}"
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px] text-slate-500">
                <div>
                  Completed At:{' '}
                  <strong className="text-slate-800">
                    {new Date(job.completionDetails.completedAt).toLocaleString('en-IN')}
                  </strong>
                </div>
                {job.completionDetails.confirmedAt && (
                  <div>
                    Customer Confirmed At:{' '}
                    <strong className="text-emerald-700">
                      {new Date(job.completionDetails.confirmedAt).toLocaleString('en-IN')}
                    </strong>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Checkpoints when work is not yet marked complete */
        <Card className="border-slate-200">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              SolveBid Verified Completion Protocol
            </CardTitle>
            <CardDescription className="text-xs">
              Every job adheres to a two-sided verification protocol to prevent premature closure.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-3 text-xs text-slate-600">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold text-xs">
                1
              </div>
              <div>
                <h4 className="font-bold text-slate-900">On-Site Completion by Professional</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  The professional marks the job complete from the Overview tab after finishing physical repairs and performing operational tests.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold text-xs">
                2
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Inspection & Customer Sign-Off</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  The customer inspects the functioning equipment and confirms completion. If any issue remains, customer may request a redo or open a dispute.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold text-xs">
                3
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Archival & Verified Record</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  The verified job history is permanently logged in the customer's portal and the contractor's verified reputation record.
                </p>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <Link to={`/jobs/${job.id}`}>
                <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5 text-blue-700">
                  <Wrench className="w-3.5 h-3.5" />
                  View Lifecycle & Progress
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CONFIRMATION MODAL */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Service Completion"
        description="Verify that the professional has fully executed the service deliverables."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmModalOpen(false)}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmCompletion}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isSubmitting ? 'Confirming...' : 'Confirm & Sign Off'}
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs text-slate-600">
          <p>
            By confirming completion on Job #{job.id}, you acknowledge that <strong>{job.professionalName}</strong> has completed the agreed service satisfactorily.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Feedback or Confirmation Note (Optional)
            </label>
            <textarea
              rows={3}
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
              placeholder="e.g., AC cooling perfectly now, tested cooling coil and fan speeds. Excellent work."
              className="w-full p-2.5 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
