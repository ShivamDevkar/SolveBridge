import { useState, useEffect, useCallback } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { mockJobAdapter } from '@/services/mockJobAdapter';
import type { JobWorkspaceContextType } from '@/layouts/JobWorkspaceLayout';
import type { JobLifecycleStatus, JobActivityEvent } from '@/types/job';
import {
  Wrench,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Send,
  ShieldCheck,
  Lock,
  FileText,
  AlertCircle,
  Info,
  MessageSquare,
} from 'lucide-react';

export function JobWorkspaceOverviewPage() {
  const { job, refreshJob } = useOutletContext<JobWorkspaceContextType>();
  const { user, role } = useAuth();

  const [activities, setActivities] = useState<JobActivityEvent[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);

  // Quick Progress Update form state
  const [progressNote, setProgressNote] = useState('');
  const [isSubmittingProgress, setIsSubmittingProgress] = useState(false);
  const [progressError, setProgressError] = useState<string | null>(null);

  // Status Action Modal State
  const [confirmStatusModal, setConfirmStatusModal] = useState<{
    targetStatus: JobLifecycleStatus;
    title: string;
    description: string;
  } | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Schedule Update Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [newScheduleTime, setNewScheduleTime] = useState('');
  const [scheduleNote, setScheduleNote] = useState('');
  const [isUpdatingSchedule, setIsUpdatingSchedule] = useState(false);

  // Completion Request Modal State (Professional)
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [completionWorkSummary, setCompletionWorkSummary] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [isSubmittingCompletion, setIsSubmittingCompletion] = useState(false);

  // Customer Confirmation Modal State (Customer)
  const [isCustomerConfirmModalOpen, setIsCustomerConfirmModalOpen] = useState(false);
  const [customerFeedbackNote, setCustomerFeedbackNote] = useState('');
  const [isSubmittingCustomerConfirm, setIsSubmittingCustomerConfirm] = useState(false);

  // Success Feedback
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const loadActivities = useCallback(async () => {
    if (!job?.id) return;
    try {
      const list = await mockJobAdapter.getJobActivities(job.id);
      setActivities(list);
    } catch (err) {
      console.error('Failed to load job activities:', err);
    } finally {
      setIsLoadingActivities(false);
    }
  }, [job?.id]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  if (!job) {
    return null;
  }

  const isCustomer = role === 'CUSTOMER';
  const isProfessional = role === 'PROFESSIONAL';
  const isAdmin = role === 'ADMIN';

  const actor = {
    id: user?.id || (isProfessional ? 'user-demo-pro' : 'user-demo-customer'),
    name: user?.name || (isProfessional ? 'Arun Kumar' : 'Sarthak Chavan'),
    role: (isProfessional ? 'PROFESSIONAL' : isCustomer ? 'CUSTOMER' : 'ADMIN') as any,
  };

  // Handle Quick Progress Update (Pro)
  const handleAddProgressUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progressNote.trim() || progressNote.trim().length < 5) {
      setProgressError('Please write a note of at least 5 characters.');
      return;
    }

    setIsSubmittingProgress(true);
    setProgressError(null);
    try {
      await mockJobAdapter.addProgressUpdate(job.id, progressNote.trim(), actor);
      setProgressNote('');
      setSuccessBanner('Progress update posted to the job activity feed.');
      await loadActivities();
      await refreshJob();
    } catch (err: any) {
      setProgressError(err.message || 'Failed to post update.');
    } finally {
      setIsSubmittingProgress(false);
    }
  };

  // Handle Status Transitions
  const handleExecuteStatusUpdate = async () => {
    if (!confirmStatusModal) return;

    setIsUpdatingStatus(true);
    try {
      await mockJobAdapter.updateJobStatus(
        job.id,
        confirmStatusModal.targetStatus,
        actor,
        confirmStatusModal.description
      );
      setSuccessBanner(`Job status updated to ${confirmStatusModal.targetStatus.replace(/_/g, ' ')}.`);
      setConfirmStatusModal(null);
      await refreshJob();
      await loadActivities();
    } catch (err: any) {
      console.error('Status transition failed:', err);
      alert(err.message || 'Failed to update job status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle Schedule Update
  const handleUpdateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScheduleTime.trim()) return;

    setIsUpdatingSchedule(true);
    try {
      await mockJobAdapter.updateJobSchedule(job.id, newScheduleTime.trim(), actor, scheduleNote.trim());
      setSuccessBanner('Appointment schedule updated successfully.');
      setIsScheduleModalOpen(false);
      setNewScheduleTime('');
      setScheduleNote('');
      await refreshJob();
      await loadActivities();
    } catch (err: any) {
      alert(err.message || 'Failed to update schedule.');
    } finally {
      setIsUpdatingSchedule(false);
    }
  };

  // Handle Professional Completion Request
  const handleSubmitCompletionRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completionWorkSummary.trim() || completionWorkSummary.trim().length < 10) {
      alert('Please enter a work summary of at least 10 characters.');
      return;
    }

    setIsSubmittingCompletion(true);
    try {
      await mockJobAdapter.requestJobCompletion(
        job.id,
        {
          workDone: completionWorkSummary.trim(),
          notes: completionNotes.trim(),
        },
        actor
      );
      setSuccessBanner('Work completion requested. Customer has been alerted for verification and sign-off.');
      setIsCompletionModalOpen(false);
      setCompletionWorkSummary('');
      setCompletionNotes('');
      await refreshJob();
      await loadActivities();
    } catch (err: any) {
      alert(err.message || 'Failed to submit completion.');
    } finally {
      setIsSubmittingCompletion(false);
    }
  };

  // Handle Customer Completion Confirmation
  const handleCustomerConfirm = async () => {
    setIsSubmittingCustomerConfirm(true);
    try {
      await mockJobAdapter.confirmJobCompletion(job.id, actor, customerFeedbackNote.trim());
      setSuccessBanner('Job completion confirmed! You have verified satisfactory service completion.');
      setIsCustomerConfirmModalOpen(false);
      setCustomerFeedbackNote('');
      await refreshJob();
      await loadActivities();
    } catch (err: any) {
      alert(err.message || 'Failed to confirm completion.');
    } finally {
      setIsSubmittingCustomerConfirm(false);
    }
  };

  // Status-specific action helpers
  const renderNextActionCard = () => {
    if (job.status === 'COMPLETED' && (isCustomer || isAdmin)) {
      return (
        <Card className="bg-gradient-to-r from-orange-50 to-amber-50/50 border-orange-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-orange-900 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  Action Required: Confirm Service Completion
                </span>
                <p className="text-xs text-orange-950 font-medium leading-relaxed max-w-xl">
                  {job.professionalName} has marked this service complete. Please review the completed work details below and confirm satisfactory resolution.
                </p>
                {job.completionDetails && (
                  <div className="mt-2 p-2.5 rounded-lg bg-white/80 border border-orange-200/80 text-xs text-slate-800">
                    <strong>Contractor Summary:</strong> {job.completionDetails.workDone}
                  </div>
                )}
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsCustomerConfirmModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 shadow-sm"
                rightIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Confirm Completion & Sign Off
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (job.status === 'CUSTOMER_CONFIRMED') {
      return (
        <Card className="bg-emerald-50/70 border-emerald-200 shadow-sm">
          <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Service Confirmed by Customer
              </span>
              <p className="text-xs text-emerald-950 font-medium leading-relaxed max-w-xl">
                Completion confirmation recorded on{' '}
                <strong>
                  {job.customerConfirmedAt
                    ? new Date(job.customerConfirmedAt).toLocaleString()
                    : 'Recently'}
                </strong>
                . Service obligations are fully satisfied.
              </p>
            </div>
            <Link to={`/jobs/${job.id}/review`}>
              <Button variant="outline" size="sm" className="bg-white border-emerald-300 text-emerald-800 shrink-0">
                Leave Verified Review
              </Button>
            </Link>
          </CardContent>
        </Card>
      );
    }

    if (isProfessional || isAdmin) {
      if (job.status === 'SCHEDULED') {
        return (
          <Card className="bg-blue-50/70 border-blue-200 shadow-sm">
            <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Upcoming Service Visit
                </span>
                <p className="text-xs text-blue-950 font-medium">
                  Appointment set for <strong>{job.scheduledAt}</strong>. When you begin traveling to the customer location, mark your status as &quot;On The Way&quot;.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  setConfirmStatusModal({
                    targetStatus: 'ON_THE_WAY',
                    title: 'Mark Status: On The Way',
                    description: 'Alert the customer that you have departed and are en route to the service address.',
                  })
                }
              >
                Mark On The Way
              </Button>
            </CardContent>
          </Card>
        );
      }

      if (job.status === 'ON_THE_WAY') {
        return (
          <Card className="bg-amber-50/70 border-amber-200 shadow-sm">
            <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  En Route to Customer Address
                </span>
                <p className="text-xs text-amber-950 font-medium">
                  Once you reach {job.exactServiceAddress}, check in to confirm arrival on site.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() =>
                  setConfirmStatusModal({
                    targetStatus: 'ARRIVED',
                    title: 'Mark Status: Arrived on Site',
                    description: 'Confirm arrival at the customer premises to unlock diagnostic inspection.',
                  })
                }
              >
                Mark Arrived on Site
              </Button>
            </CardContent>
          </Card>
        );
      }

      if (job.status === 'ARRIVED' || job.status === 'INSPECTION') {
        return (
          <Card className="bg-purple-50/70 border-purple-200 shadow-sm">
            <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-purple-600" />
                  On-Site Diagnostic & Work Execution
                </span>
                <p className="text-xs text-purple-950 font-medium">
                  Arrived on premises. When you start hands-on repair work, update status to &quot;In Progress&quot;.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() =>
                  setConfirmStatusModal({
                    targetStatus: 'IN_PROGRESS',
                    title: 'Start Work: In Progress',
                    description: 'Start physical repair or service execution. Timestamps will be recorded in the audit log.',
                  })
                }
              >
                Start Work / In Progress
              </Button>
            </CardContent>
          </Card>
        );
      }

      if (job.status === 'IN_PROGRESS') {
        return (
          <Card className="bg-indigo-50/70 border-indigo-200 shadow-sm">
            <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-indigo-600" />
                  Work Currently In Progress
                </span>
                <p className="text-xs text-indigo-950 font-medium">
                  Once service is finished and testing passes, submit your completion request for customer verification.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
                onClick={() => setIsCompletionModalOpen(true)}
                rightIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Submit Completion Request
              </Button>
            </CardContent>
          </Card>
        );
      }
    }

    return null;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Success Notification */}
      {successBanner && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between gap-3 shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold text-xs cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Dynamic Action Required Banner */}
      {renderNextActionCard()}

      {/* Main Grid: Overview & Details Left, Activity Feed & Schedule Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Engagement Overview, Details, and Timeline */}
        <div className="lg:col-span-7 space-y-6">
          {/* Engagement Overview Card */}
          <Card className="bg-white border-slate-200 shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Service Engagement Overview
              </CardTitle>
              <span className="text-[11px] font-mono text-slate-400">
                Created: {new Date(job.createdAt).toLocaleDateString()}
              </span>
            </CardHeader>

            <CardContent className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Customer Information */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Customer</span>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                      {job.customerName[0]}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">{job.customerName}</span>
                      <span className="text-[11px] text-slate-500">ID: {job.customerId}</span>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Assigned Contractor</span>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                      {job.professionalName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-900 block">{job.professionalName}</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      </div>
                      <Link
                        to={`/professionals/${job.professionalId}`}
                        className="text-[11px] text-blue-600 hover:underline font-semibold"
                      >
                        View Verified Profile →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial & Scope Summary */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Agreed Solution Price</span>
                  <span className="text-lg font-black text-slate-900">
                    ₹{job.currentAmount.toLocaleString()}
                  </span>
                </div>
                {job.originalAmount !== job.currentAmount && (
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>Original Accepted Quote:</span>
                    <span className="line-through">₹{job.originalAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>No advance charge. Payment settles after customer sign-off.</span>
                  </span>
                  <Link to={`/jobs/${job.id}/quote-revision`} className="text-blue-600 font-semibold hover:underline">
                    View Scope / Revisions
                  </Link>
                </div>
              </div>

              {/* Service Address Card */}
              <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200/70 space-y-1">
                <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Exact Disclosed Service Location</span>
                </div>
                <p className="text-slate-800 font-mono text-xs pl-5.5">{job.exactServiceAddress}</p>
                <p className="text-[10px] text-slate-500 pl-5.5">
                  Restricted access: Address is securely unlocked only for the assigned customer and contractor.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Job Milestone Timestamps & Explanations (Task B) */}
          <Card className="bg-white border-slate-200 shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Job Lifecycle Milestones & Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200/70">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">1. Proposal Accepted & Scheduled</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(job.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-600">
                      Customer accepted the quote. Job workspace channel created and street address unlocked.
                    </p>
                  </div>
                </div>

                <div className={`flex items-start gap-3 p-3 rounded-lg border ${
                  job.startedAt ? 'bg-slate-50 border-slate-200/70' : 'bg-slate-50/40 border-slate-200/40 opacity-70'
                }`}>
                  {job.startedAt ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">2. On-Site Work Started</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {job.startedAt ? new Date(job.startedAt).toLocaleString() : 'Pending'}
                      </span>
                    </div>
                    <p className="text-slate-600">
                      Professional checked in on-site and initiated diagnostic/repair activities.
                    </p>
                  </div>
                </div>

                <div className={`flex items-start gap-3 p-3 rounded-lg border ${
                  job.completedAt ? 'bg-slate-50 border-slate-200/70' : 'bg-slate-50/40 border-slate-200/40 opacity-70'
                }`}>
                  {job.completedAt ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">3. Work Completed by Professional</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {job.completedAt ? new Date(job.completedAt).toLocaleString() : 'Pending'}
                      </span>
                    </div>
                    <p className="text-slate-600">
                      Contractor finished hands-on repair and submitted completion summary.
                    </p>
                  </div>
                </div>

                <div className={`flex items-start gap-3 p-3 rounded-lg border ${
                  job.customerConfirmedAt ? 'bg-slate-50 border-slate-200/70' : 'bg-slate-50/40 border-slate-200/40 opacity-70'
                }`}>
                  {job.customerConfirmedAt ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">4. Customer Confirmation & Sign-Off</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {job.customerConfirmedAt ? new Date(job.customerConfirmedAt).toLocaleString() : 'Mandatory Gate'}
                      </span>
                    </div>
                    <p className="text-slate-600">
                      Customer verified equipment function and confirmed completion. Required before final closure.
                    </p>
                  </div>
                </div>
              </div>

              {/* Unresolved Decision #1 Notice */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-950 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Info className="w-3.5 h-3.5 text-amber-600" />
                  <span>Architecture Notice — Unresolved Decision #1</span>
                </div>
                <p className="leading-relaxed">
                  The final transition sequence following customer confirmation is an open decision:
                  Option A (<code>COMPLETED → CUSTOMER_CONFIRMED → CLOSED</code>) vs. Option B (<code>COMPLETED → CUSTOMER_CONFIRMED → REVIEW_PENDING → CLOSED</code>).
                  Customer confirmation is mandatory in both models before final job closure.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (5 cols): Schedule, Progress Note Form, and Activity Feed */}
        <div className="lg:col-span-5 space-y-6">
          {/* Appointment & Schedule Card (Task E) */}
          <Card className="bg-white border-slate-200 shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Appointment & Scheduling
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-blue-600 h-7 px-2"
                onClick={() => {
                  setNewScheduleTime(job.scheduledAt);
                  setScheduleNote(job.scheduleNotes || '');
                  setIsScheduleModalOpen(true);
                }}
              >
                Propose Adjustment
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Confirmed Arrival Slot</span>
                <span className="text-sm font-bold text-slate-900 block">{job.scheduledAt}</span>
                <span className="text-slate-500">Duration: {job.durationEstimate || '1–2 hours'}</span>
              </div>

              {job.scheduleNotes && (
                <div className="text-[11px] text-slate-600 italic">
                  <strong>Special Instructions:</strong> {job.scheduleNotes}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Professional Progress Update Input (Task D) */}
          {isProfessional && (
            <Card className="bg-white border-slate-200 shadow-2xs">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Send className="w-4 h-4 text-blue-600" />
                  Post Operational Update
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <form onSubmit={handleAddProgressUpdate} className="space-y-3 text-xs">
                  {progressError && (
                    <div className="p-2.5 rounded bg-red-50 border border-red-200 text-red-700 text-xs">
                      {progressError}
                    </div>
                  )}
                  <textarea
                    value={progressNote}
                    onChange={(e) => setProgressNote(e.target.value)}
                    rows={2}
                    placeholder="e.g. Measured 115 PSI on condenser manifold; flushing drain pipe..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      isLoading={isSubmittingProgress}
                      leftIcon={<Send className="w-3.5 h-3.5" />}
                    >
                      Post Progress Note
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Job Activity Feed (Task D) */}
          <Card className="bg-white border-slate-200 shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                Live Job Activity Feed ({activities.length})
              </CardTitle>
              <Link to={`/jobs/${job.id}/chat`} className="text-xs text-blue-600 font-semibold hover:underline">
                Open Chat Stream →
              </Link>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              {isLoadingActivities ? (
                <div className="text-center py-6 text-slate-400 text-xs">Loading activity stream...</div>
              ) : activities.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">No activity logged yet.</div>
              ) : (
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {activities.map((act) => {
                    const isSystem = act.actorRole === 'SYSTEM';
                    const isPro = act.actorRole === 'PROFESSIONAL';
                    return (
                      <div
                        key={act.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{act.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-[11px]">{act.description}</p>
                        <div className="flex items-center gap-2 pt-1">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${
                              isSystem
                                ? 'bg-slate-100 text-slate-600 border-slate-200'
                                : isPro
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {act.actorName} ({act.actorRole})
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CONFIRM STATUS TRANSITION MODAL */}
      {confirmStatusModal && (
        <Modal
          isOpen={!!confirmStatusModal}
          onClose={() => !isUpdatingStatus && setConfirmStatusModal(null)}
          title={confirmStatusModal.title}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-700 leading-relaxed">{confirmStatusModal.description}</p>
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900">
              This transition will record an immutable timestamp in the job activity audit log and update the shared stepper.
            </div>
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                disabled={isUpdatingStatus}
                onClick={() => setConfirmStatusModal(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isUpdatingStatus}
                onClick={handleExecuteStatusUpdate}
              >
                Confirm Status Transition
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* UPDATE SCHEDULE MODAL (Task E) */}
      {isScheduleModalOpen && (
        <Modal
          isOpen={isScheduleModalOpen}
          onClose={() => !isUpdatingSchedule && setIsScheduleModalOpen(false)}
          title="Propose Appointment Schedule Adjustment"
          size="md"
        >
          <form onSubmit={handleUpdateSchedule} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                New Arrival Time Window <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newScheduleTime}
                onChange={(e) => setNewScheduleTime(e.target.value)}
                placeholder="e.g. Tomorrow, 11:00 AM or Today, 6:00 PM"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Reason / Note for Participant</label>
              <input
                type="text"
                value={scheduleNote}
                onChange={(e) => setScheduleNote(e.target.value)}
                placeholder="e.g. Traffic delay, earlier availability slot..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUpdatingSchedule}
                onClick={() => setIsScheduleModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isUpdatingSchedule}>
                Update Schedule
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* PROFESSIONAL COMPLETION REQUEST MODAL (Task F) */}
      {isCompletionModalOpen && (
        <Modal
          isOpen={isCompletionModalOpen}
          onClose={() => !isSubmittingCompletion && setIsCompletionModalOpen(false)}
          title="Submit Service Completion Request"
          size="md"
        >
          <form onSubmit={handleSubmitCompletionRequest} className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900">
              Submitting completion signals to the customer that physical work is done. The customer must inspect the work and confirm completion.
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Summary of Work Performed <span className="text-red-500">*</span>
              </label>
              <textarea
                value={completionWorkSummary}
                onChange={(e) => setCompletionWorkSummary(e.target.value)}
                rows={3}
                placeholder="Detail what was diagnosed, parts tested or replaced, and final operating check..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Care Notes / Warranty Information</label>
              <input
                type="text"
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="e.g. Clean filters every 30 days. 30-day workmanship guarantee."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmittingCompletion}
                onClick={() => setIsCompletionModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                isLoading={isSubmittingCompletion}
              >
                Submit Completion Request
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* CUSTOMER CONFIRMATION MODAL (Task F) */}
      {isCustomerConfirmModalOpen && (
        <Modal
          isOpen={isCustomerConfirmModalOpen}
          onClose={() => !isSubmittingCustomerConfirm && setIsCustomerConfirmModalOpen(false)}
          title="Confirm Completion & Sign Off"
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Service Resolution Verification</span>
              </div>
              <p className="leading-relaxed">
                By confirming, you verify that {job.professionalName} has completed the service according to the agreed quote of ₹{job.currentAmount.toLocaleString()}.
              </p>
              {job.completionDetails && (
                <div className="p-2.5 rounded bg-white border border-emerald-200 text-slate-800 text-[11px]">
                  <strong>Contractor Summary:</strong> {job.completionDetails.workDone}
                </div>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Feedback Notes / Remarks (Optional)
              </label>
              <textarea
                value={customerFeedbackNote}
                onChange={(e) => setCustomerFeedbackNote(e.target.value)}
                rows={2}
                placeholder="e.g. AC is cooling properly now. Clean and punctual service."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                disabled={isSubmittingCustomerConfirm}
                onClick={() => setIsCustomerConfirmModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                isLoading={isSubmittingCustomerConfirm}
                onClick={handleCustomerConfirm}
              >
                Confirm Completion
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
