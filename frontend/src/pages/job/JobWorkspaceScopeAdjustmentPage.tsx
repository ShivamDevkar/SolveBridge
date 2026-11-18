import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { mockScopeAdjustmentAdapter } from '@/services/mockScopeAdjustmentAdapter';
import type { JobWorkspaceContextType } from '@/layouts/JobWorkspaceLayout';
import type { ScopeAdjustment, ScopeAdjustmentParty } from '@/types/scopeAdjustment';
import {
  FileEdit,
  PlusCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ShieldAlert,
  ArrowLeft,
  Layers,
  Paperclip,
  X,
  Image as ImageIcon,
  Ban,
  Info,
} from 'lucide-react';

export function JobWorkspaceScopeAdjustmentPage() {
  const { job, refreshJob } = useOutletContext<JobWorkspaceContextType>();
  const { user, role } = useAuth();

  const [adjustments, setAdjustments] = useState<ScopeAdjustment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New Adjustment Modal state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newExplanation, setNewExplanation] = useState('');
  const [newReason, setNewReason] = useState('');
  const [newCostAdjustment, setNewCostAdjustment] = useState<number>(0);
  const [newDurationImpact, setNewDurationImpact] = useState('+30 minutes');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Attachment state for new adjustment
  const [attachment, setAttachment] = useState<{
    name: string;
    dataUrl: string;
    size: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Respond Modal state (Accept/Decline)
  const [respondingAdjustment, setRespondingAdjustment] = useState<{
    adj: ScopeAdjustment;
    action: 'ACCEPT' | 'DECLINE';
  } | null>(null);
  const [responseNote, setResponseNote] = useState('');
  const [isResponding, setIsResponding] = useState(false);

  // Preview Image Modal state
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);

  const loadAdjustments = useCallback(async () => {
    if (!job) return;
    try {
      const data = await mockScopeAdjustmentAdapter.getAdjustmentsForJob(job.id);
      setAdjustments(data);
    } catch (err) {
      console.error('Failed to load scope adjustments:', err);
      setErrorMessage('Could not load scope adjustments.');
    } finally {
      setIsLoading(false);
    }
  }, [job]);

  useEffect(() => {
    loadAdjustments();
  }, [loadAdjustments]);

  if (!job) {
    return null;
  }

  // Access Control
  const isParticipant =
    role === 'ADMIN' ||
    (user && (user.id === job.customerId || user.id === (job.professionalUserId ?? job.professionalId)));

  if (!isParticipant) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-8 text-center shadow-xs max-w-xl mx-auto my-12 space-y-4">
        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900">Access Restricted</h3>
          <p className="text-sm text-slate-600">
            You are not an authorized participant in this Job Workspace. Scope adjustments can only be requested and evaluated by the assigned customer and professional.
          </p>
        </div>
        <div className="pt-2">
          <Link to={role === 'PROFESSIONAL' ? '/pro/jobs' : '/customer/jobs'}>
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Return to My Jobs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentViewerParty: ScopeAdjustmentParty =
    user?.id === job.customerId || role === 'CUSTOMER' ? 'CUSTOMER' : 'PROFESSIONAL';

  const pendingAdjustments = adjustments.filter((a) => a.status === 'PENDING');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setModalError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setModalError('Invalid file format. Only JPEG, PNG, or WebP images are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setModalError('Image size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        name: file.name,
        dataUrl: reader.result as string,
        size: file.size,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCreateAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newExplanation.trim() || !newReason.trim()) {
      setModalError('Please fill in all mandatory fields.');
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    try {
      await mockScopeAdjustmentAdapter.requestScopeAdjustment(
        {
          jobId: job.id,
          title: newTitle.trim(),
          explanation: newExplanation.trim(),
          reason: newReason.trim(),
          costAdjustment: Number(newCostAdjustment) || 0,
          durationImpact: newDurationImpact.trim(),
          attachment: attachment || undefined,
        },
        {
          id: user?.id || (currentViewerParty === 'CUSTOMER' ? job.customerId : job.professionalId),
          name: user?.name || (currentViewerParty === 'CUSTOMER' ? job.customerName : job.professionalName),
          role: currentViewerParty,
        }
      );

      await loadAdjustments();
      await refreshJob();
      setIsNewModalOpen(false);
      setNewTitle('');
      setNewExplanation('');
      setNewReason('');
      setNewCostAdjustment(0);
      setAttachment(null);
    } catch (err: any) {
      setModalError(err?.message || 'Failed to submit scope adjustment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmResponse = async () => {
    if (!respondingAdjustment) return;

    setIsResponding(true);
    try {
      await mockScopeAdjustmentAdapter.respondToScopeAdjustment(
        respondingAdjustment.adj.id,
        respondingAdjustment.action,
        {
          id: user?.id || (currentViewerParty === 'CUSTOMER' ? job.customerId : job.professionalId),
          name: user?.name || (currentViewerParty === 'CUSTOMER' ? job.customerName : job.professionalName),
          role: currentViewerParty,
        },
        responseNote
      );

      await loadAdjustments();
      await refreshJob();
      setRespondingAdjustment(null);
      setResponseNote('');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to submit response.');
    } finally {
      setIsResponding(false);
    }
  };

  const handleCancelAdjustment = async (adjId: string) => {
    if (!confirm('Are you sure you want to cancel this pending adjustment request?')) return;
    try {
      await mockScopeAdjustmentAdapter.cancelScopeAdjustment(adjId, user?.id || '');
      await loadAdjustments();
      await refreshJob();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to cancel adjustment.');
    }
  };

  const getStatusBadge = (status: ScopeAdjustment['status']) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Awaiting Review
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Scope Approved
          </span>
        );
      case 'DECLINED':
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Scope Declined
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
            <Ban className="w-3 h-3" /> Withdrawn
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Financial & Scope Baseline */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              #{job.id}
            </span>
            <h2 className="text-lg font-bold text-slate-900">Post-Acceptance Scope Adjustments</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Transparently propose, review, and approve additional parts, labor adjustments, or scope reductions discovered during diagnostic inspection.
          </p>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 w-full md:w-auto justify-between md:justify-end">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Original Accepted Quote</span>
            <span className="text-sm font-semibold text-slate-700 font-mono">₹{job.originalAmount.toLocaleString()}</span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-right">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Current Agreed Total</span>
            <span className="text-base font-bold text-emerald-700 font-mono">₹{job.currentAmount.toLocaleString()}</span>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewModalOpen(true)}
            leftIcon={<PlusCircle className="w-4 h-4" />}
            className="shadow-2xs text-xs"
          >
            Request Scope Adjustment
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PENDING ADJUSTMENT HIGHLIGHT (IF ANY) */}
      {pendingAdjustments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Action Required: Pending Scope Adjustment ({pendingAdjustments.length})
            </h3>
          </div>

          <div className="space-y-4">
            {pendingAdjustments.map((adj) => {
              const isViewerInitiator = adj.initiatorRole === currentViewerParty;
              return (
                <Card key={adj.id} className="bg-white border-2 border-amber-300 shadow-sm overflow-hidden">
                  <div className="bg-amber-50/80 px-5 py-3 border-b border-amber-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                        Adjustment #{adj.adjustmentNumber}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{adj.title}</h4>
                      {getStatusBadge(adj.status)}
                    </div>
                    <span className="text-xs text-slate-500">
                      Proposed by: <strong className="text-slate-800">{adj.initiatorName}</strong> ({adj.initiatorRole})
                    </span>
                  </div>

                  <CardContent className="p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Inspection Discovery / Justification
                        </span>
                        <p className="text-slate-800 leading-relaxed font-medium">{adj.reason}</p>
                      </div>

                      <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Scope Description & Specific Parts
                        </span>
                        <p className="text-slate-800 leading-relaxed">{adj.explanation}</p>
                      </div>
                    </div>

                    {/* Financial & Duration Impact Comparison Matrix */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Baseline Amount</span>
                        <span className="font-mono font-semibold text-slate-700 text-sm">
                          ₹{adj.originalJobAmount.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Cost Delta</span>
                        <span
                          className={`font-mono font-bold text-sm ${
                            adj.costAdjustment >= 0 ? 'text-amber-700' : 'text-emerald-700'
                          }`}
                        >
                          {adj.costAdjustment >= 0 ? `+₹${adj.costAdjustment.toLocaleString()}` : `-₹${Math.abs(adj.costAdjustment).toLocaleString()}`}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Proposed New Total</span>
                        <span className="font-mono font-bold text-base text-blue-700">
                          ₹{adj.resultingJobAmount.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Duration Impact</span>
                        <span className="font-semibold text-slate-800 text-sm">{adj.durationImpact}</span>
                      </div>
                    </div>

                    {/* Attachment if present */}
                    {adj.attachmentUrl && (
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setPreviewImage({ url: adj.attachmentUrl!, name: adj.attachmentName || 'Evidence' })}
                          className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 text-xs text-blue-600 font-semibold cursor-pointer"
                        >
                          <ImageIcon className="w-4 h-4 text-slate-500" />
                          <span>View Discovery Photo ({adj.attachmentName})</span>
                        </button>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
                      <span className="text-xs text-slate-500">
                        Submitted: {new Date(adj.createdAt).toLocaleString()}
                      </span>

                      <div className="flex items-center gap-2">
                        {isViewerInitiator ? (
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500 italic">
                              Waiting for {adj.initiatorRole === 'PROFESSIONAL' ? job.customerName : job.professionalName} to review
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelAdjustment(adj.id)}
                              className="text-xs text-red-600 hover:bg-red-50"
                            >
                              Withdraw Request
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setRespondingAdjustment({ adj, action: 'DECLINE' })}
                              className="text-xs text-red-700 hover:bg-red-50 border-red-200"
                              leftIcon={<XCircle className="w-3.5 h-3.5" />}
                            >
                              Decline Scope
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => setRespondingAdjustment({ adj, action: 'ACCEPT' })}
                              className="text-xs bg-emerald-600 hover:bg-emerald-700"
                              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                            >
                              Approve Adjustment (₹{adj.resultingJobAmount.toLocaleString()})
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* SCOPE ADJUSTMENT AUDIT TRAIL & HISTORY */}
      <Card className="bg-white border-slate-200 shadow-2xs">
        <CardHeader className="py-4 px-6 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-sm font-bold text-slate-900">
              Adjustment History & Permanent Audit Trail
            </CardTitle>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            {adjustments.length} total adjustment records
          </span>
        </CardHeader>

        <CardContent className="p-6">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Clock className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
              <p className="text-xs">Loading adjustment records...</p>
            </div>
          ) : adjustments.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <FileEdit className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No Scope Adjustments Recorded</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No formal revisions or scope modifications have been requested for this job. Work proceeds under the original baseline quote of ₹{job.originalAmount.toLocaleString()}.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {adjustments.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    item.status === 'ACCEPTED'
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : item.status === 'DECLINED'
                      ? 'bg-red-50/30 border-red-200'
                      : item.status === 'PENDING'
                      ? 'bg-amber-50/30 border-amber-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-black/5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                        #{item.adjustmentNumber}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                      {getStatusBadge(item.status)}
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString()} at{' '}
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Justification</span>
                      <p className="text-slate-700 leading-relaxed">{item.reason}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Scope Details</span>
                      <p className="text-slate-700 leading-relaxed">{item.explanation}</p>
                    </div>
                    <div className="space-y-1 bg-white p-2.5 rounded border border-slate-200 text-center flex flex-col justify-center">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Initiated By:</span>
                        <strong className="text-slate-800">{item.initiatorName}</strong>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Agreed Delta:</span>
                        <strong className={item.costAdjustment >= 0 ? 'text-amber-700 font-mono' : 'text-emerald-700 font-mono'}>
                          {item.costAdjustment >= 0 ? `+₹${item.costAdjustment}` : `-₹${Math.abs(item.costAdjustment)}`}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Resulting Total:</span>
                        <strong className="text-slate-900 font-mono">₹{item.resultingJobAmount.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>

                  {item.responseNote && (
                    <div className="mt-2 p-2.5 bg-white/80 rounded border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>{item.responderName} response note:</strong> {item.responseNote}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* CREATE SCOPE ADJUSTMENT MODAL */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Request Post-Acceptance Scope Adjustment"
        description="Formal scope or cost adjustment request. Work will not proceed on these items until approved by the counterparty."
        size="lg"
      >
        <form onSubmit={handleCreateAdjustment} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Adjustment Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Replace Damaged Run Capacitor & Terminals"
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Diagnostic Discovery / Reason for Scope Change <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              placeholder="Explain the inspection findings that necessitate this scope adjustment (e.g. Capacitor capacitance degraded to 12μF)..."
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-hidden resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Detailed Scope & Parts Specification <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={newExplanation}
              onChange={(e) => setNewExplanation(e.target.value)}
              placeholder="List specific new parts, part numbers, labor steps, and exact work items included in this adjustment..."
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-hidden resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Cost Adjustment (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={newCostAdjustment}
                onChange={(e) => setNewCostAdjustment(Number(e.target.value))}
                placeholder="+450 or -200"
                className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Positive number for additional work; negative for scope reduction.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Expected Duration Impact
              </label>
              <input
                type="text"
                value={newDurationImpact}
                onChange={(e) => setNewDurationImpact(e.target.value)}
                placeholder="e.g. +30 minutes, +1 hour, No change"
                className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Real-time pricing impact preview */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-1">
            <div className="flex justify-between text-slate-700">
              <span>Current Agreed Amount:</span>
              <span className="font-mono font-bold">₹{job.currentAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Proposed Adjustment:</span>
              <span className="font-mono font-bold text-blue-700">
                {newCostAdjustment >= 0 ? `+₹${newCostAdjustment}` : `-₹${Math.abs(newCostAdjustment)}`}
              </span>
            </div>
            <div className="flex justify-between text-slate-900 border-t border-blue-200 pt-1 font-bold">
              <span>Resulting Total If Approved:</span>
              <span className="font-mono text-emerald-700 text-sm">
                ₹{Math.max(0, job.currentAmount + (Number(newCostAdjustment) || 0)).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Photo attachment upload */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Supporting Discovery Photo (Optional, max 5MB)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
            />
            {attachment ? (
              <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                <img
                  src={attachment.dataUrl}
                  alt="Preview"
                  className="w-10 h-10 object-cover rounded border border-slate-200"
                />
                <div className="flex-1 min-w-0 text-xs">
                  <p className="font-semibold text-slate-800 truncate">{attachment.name}</p>
                  <p className="text-[10px] text-slate-500">{(attachment.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<Paperclip className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Upload Inspection Evidence Photo
              </Button>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsNewModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Scope Adjustment'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* RESPOND MODAL (ACCEPT / DECLINE) */}
      {respondingAdjustment && (
        <Modal
          isOpen={!!respondingAdjustment}
          onClose={() => setRespondingAdjustment(null)}
          title={`${respondingAdjustment.action === 'ACCEPT' ? 'Approve' : 'Decline'} Scope Adjustment`}
          description={`Are you sure you want to ${respondingAdjustment.action.toLowerCase()} Scope Adjustment #${respondingAdjustment.adj.adjustmentNumber}?`}
          size="md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <p><strong>Title:</strong> {respondingAdjustment.adj.title}</p>
              <p><strong>Cost Delta:</strong> ₹{respondingAdjustment.adj.costAdjustment}</p>
              <p>
                <strong>New Job Total:</strong>{' '}
                <span className="font-mono font-bold text-emerald-700">
                  ₹{respondingAdjustment.adj.resultingJobAmount.toLocaleString()}
                </span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Optional Response Note / Instruction
              </label>
              <textarea
                rows={2}
                value={responseNote}
                onChange={(e) => setResponseNote(e.target.value)}
                placeholder={
                  respondingAdjustment.action === 'ACCEPT'
                    ? 'e.g. Approved. Please proceed with the replacement immediately.'
                    : 'e.g. Declined. Please complete only the originally agreed inspection without additional parts.'
                }
                className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-hidden resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setRespondingAdjustment(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                disabled={isResponding}
                onClick={handleConfirmResponse}
                className={respondingAdjustment.action === 'ACCEPT' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {isResponding
                  ? 'Processing...'
                  : respondingAdjustment.action === 'ACCEPT'
                  ? 'Confirm Approval'
                  : 'Confirm Decline'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* PHOTO LIGHTBOX MODAL */}
      {previewImage && (
        <Modal
          isOpen={!!previewImage}
          onClose={() => setPreviewImage(null)}
          title={previewImage.name}
          size="lg"
        >
          <div className="flex flex-col items-center justify-center p-2">
            <img
              src={previewImage.url}
              alt={previewImage.name}
              className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-md"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

