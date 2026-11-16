import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { mockDisputeAdapter } from '@/services/mockDisputeAdapter';
import { mockMessageAdapter } from '@/services/mockMessageAdapter';
import { mockScopeAdjustmentAdapter } from '@/services/mockScopeAdjustmentAdapter';
import type { Dispute, ArbitrationDecisionType, DisputePriority, DisputeStatus } from '@/types/dispute';
import type { ChatMessage } from '@/types/message';
import type { ScopeAdjustment } from '@/types/scopeAdjustment';
import {
  Gavel,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Briefcase,
  User,
  MessageSquare,
  FileText,
  DollarSign,
  History,
  FileCheck,
  Eye,
} from 'lucide-react';

export function AdminDisputeDetailPage() {
  const { disputeId } = useParams<{ disputeId: string }>();
  const { user } = useAuth();

  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [adjustments, setAdjustments] = useState<ScopeAdjustment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Active investigation tab
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CHAT' | 'SCOPE' | 'HISTORY'>('OVERVIEW');

  // Arbitration Decision State
  const [selectedDecision, setSelectedDecision] = useState<ArbitrationDecisionType | null>(null);
  const [explanation, setExplanation] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDisputeData = async () => {
    if (!disputeId) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await mockDisputeAdapter.getDisputeById(disputeId);
      if (!data) {
        setErrorMessage(`Dispute #${disputeId} not found.`);
      } else {
        setDispute(data);
        // Load related chat messages and scope adjustments
        try {
          const msgs = await mockMessageAdapter.getMessages(data.jobId);
          setMessages(msgs);
        } catch {
          setMessages([]);
        }

        try {
          const adjs = await mockScopeAdjustmentAdapter.getAdjustmentsForJob(data.jobId);
          setAdjustments(adjs);
        } catch {
          setAdjustments([]);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load dispute dossier.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDisputeData();
  }, [disputeId]);

  const adminActor = {
    id: user?.id || 'admin-system',
    name: user?.name || 'Administrator',
  };

  const handleOpenConfirmModal = () => {
    if (!selectedDecision) {
      alert('Please select an arbitration outcome.');
      return;
    }
    if (explanation.trim().length < 10) {
      alert('Please provide a descriptive arbitration explanation (at least 10 characters).');
      return;
    }
    setIsConfirmModalOpen(true);
  };

  const handleExecuteArbitration = async () => {
    if (!dispute || !selectedDecision) return;
    setIsSubmitting(true);
    try {
      const updated = await mockDisputeAdapter.resolveDispute(
        {
          disputeId: dispute.id,
          decision: selectedDecision,
          explanation: explanation.trim(),
          adminNotes: adminNotes.trim() || undefined,
        },
        adminActor
      );
      setDispute(updated);
      setIsConfirmModalOpen(false);
      setSuccessMessage(
        `Dispute #${updated.id} formally resolved with decision: ${selectedDecision}. Audit trail logged.`
      );
    } catch (err: any) {
      alert(err.message || 'Failed to resolve dispute.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityBadge = (priority: DisputePriority) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
            <AlertTriangle className="w-3.5 h-3.5 text-red-700" />
            CRITICAL PRIORITY
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            HIGH PRIORITY
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            MEDIUM PRIORITY
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            LOW PRIORITY
          </span>
        );
    }
  };

  const getStatusBadge = (status: DisputeStatus) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            Open Dispute
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
      <div className="p-16 text-center text-slate-500 space-y-3">
        <Clock className="w-8 h-8 text-red-600 animate-spin mx-auto" />
        <p className="text-sm font-medium">Loading dispute investigation workspace...</p>
      </div>
    );
  }

  if (errorMessage || !dispute) {
    return (
      <div className="space-y-6">
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-800">
          <h2 className="text-base font-bold">Dispute Dossier Not Found</h2>
          <p className="text-xs mt-1">{errorMessage || 'The specified dispute case could not be retrieved.'}</p>
          <Link to="/admin/disputes" className="inline-block mt-4">
            <Button variant="outline" size="sm" className="text-xs">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Return to Disputes Center
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isCaseClosed = dispute.status === 'RESOLVED' || dispute.status === 'DISMISSED';

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/disputes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Disputes Arbitration Center
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
            {dispute.id}
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500">Job #{dispute.jobId}</span>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Case Overview Banner */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{dispute.title}</h1>
                {getPriorityBadge(dispute.priority)}
                {getStatusBadge(dispute.status)}
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600">
                <span className="font-semibold text-red-700">
                  Category: {dispute.category.replace(/_/g, ' ')}
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  Disputed Amount: ₹{dispute.disputedAmount.toLocaleString('en-IN')}
                </span>
                <span className="text-slate-500">
                  Opened: {new Date(dispute.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <Link to={`/jobs/${dispute.jobId}`}>
                <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5 text-slate-700">
                  <Briefcase className="w-3.5 h-3.5" />
                  View Job Workspace
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* IMMUTABLE RESOLUTION BANNER (If already decided) */}
      {isCaseClosed && dispute.arbitrationDecision && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white border-2 border-emerald-300 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-base">
              <Gavel className="w-5 h-5 text-emerald-700" />
              Formal Arbitration Ruling: {dispute.arbitrationDecision.decision.replace(/_/g, ' ')}
            </div>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              CASE CLOSED & EXECUTED
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-3 rounded-lg border border-emerald-100">
            <strong>Adjudication Reason:</strong> {dispute.arbitrationDecision.explanation}
          </p>

          {dispute.arbitrationDecision.adminNotes && (
            <p className="text-xs text-slate-500 italic">
              <strong>Internal Administrative Notes:</strong> {dispute.arbitrationDecision.adminNotes}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1 border-t border-emerald-100">
            <span>Arbitrator: <strong>{dispute.arbitrationDecision.arbitratorName}</strong></span>
            <span>ID: {dispute.arbitrationDecision.arbitratorId}</span>
            <span>
              Adjudicated at: {new Date(dispute.arbitrationDecision.resolvedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </div>
        </div>
      )}

      {/* Involved Parties Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Card */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-purple-600" />
                Complainant (Customer)
              </span>
              <span className="text-[11px] text-slate-400">ID: {dispute.customerId}</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{dispute.customerName}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{dispute.customerEmail || 'customer@solvebid.demo'}</p>
              <p className="text-xs text-slate-500">{dispute.customerPhone || '+91 98765 43210'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Professional Card */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Respondent (Professional)
              </span>
              <span className="text-[11px] text-slate-400">ID: {dispute.professionalId}</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{dispute.professionalName}</h3>
              {dispute.businessName && (
                <p className="text-xs font-medium text-purple-700 mt-0.5">{dispute.businessName}</p>
              )}
              <p className="text-xs text-slate-500">Service Category: {dispute.category.replace(/_/g, ' ')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investigation Evidence Tabs */}
      <Card>
        <CardHeader className="pb-0 border-b border-slate-100">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'OVERVIEW', label: 'Case Statements & Evidence', icon: FileText },
              { id: 'CHAT', label: `Chat History (${messages.length})`, icon: MessageSquare },
              { id: 'SCOPE', label: `Scope & Financials (${adjustments.length})`, icon: DollarSign },
              { id: 'HISTORY', label: `Case Event Timeline (${dispute.history.length})`, icon: History },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-2 border-b-2 ${
                    isActive
                      ? 'border-red-600 text-red-700 bg-red-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* TAB 1: STATEMENTS & EVIDENCE */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* Customer Complaint */}
              <div className="p-4 rounded-xl bg-red-50/60 border border-red-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Customer Grievance & Complaint Statement
                  </span>
                  <span className="text-[11px] text-red-600 font-medium">Filed by {dispute.customerName}</span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                  {dispute.customerComplaint}
                </p>
              </div>

              {/* Professional Technical Response */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-blue-600" />
                    Professional Rebuttal / Technical Explanation
                  </span>
                  <span className="text-[11px] text-blue-600 font-medium">Filed by {dispute.professionalName}</span>
                </div>
                {dispute.professionalResponse ? (
                  <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {dispute.professionalResponse}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    The professional has not yet submitted a formal technical rebuttal for this dispute.
                  </p>
                )}
              </div>

              {/* Photo Evidence */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Uploaded Evidence Photographs ({dispute.evidenceUrls.length})
                </h4>
                {dispute.evidenceUrls.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                    No photo attachments or receipts were attached to this dispute submission.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {dispute.evidenceUrls.map((url, i) => (
                      <div key={i} className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50 p-2">
                        <img src={url} alt={`Evidence #${i + 1}`} className="w-full h-32 object-cover rounded" />
                        <span className="text-[10px] text-slate-500 mt-1 block text-center">Attachment #{i + 1}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CHAT TRANSCRIPT */}
          {activeTab === 'CHAT' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Verbatim communication exchange during Job #{dispute.jobId}.
                </p>
                <span className="text-xs text-slate-400">{messages.length} Total Messages</span>
              </div>

              {messages.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  No recorded chat messages found for Job #{dispute.jobId}.
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto p-3 rounded-xl bg-slate-50 border border-slate-200">
                  {messages.map((msg) => {
                    const isCustomer = msg.senderRole === 'CUSTOMER';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-2xl text-xs space-y-1 shadow-2xs ${
                            isCustomer
                              ? 'bg-purple-600 text-white rounded-br-xs'
                              : 'bg-white text-slate-900 border border-slate-200 rounded-bl-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 font-semibold">
                            <span>{msg.senderName}</span>
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SCOPE & FINANCIALS */}
          {activeTab === 'SCOPE' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Mid-service scope adjustments, material additions, and price revisions logged for this job.
                </p>
                <span className="text-xs text-slate-400">{adjustments.length} Adjustments</span>
              </div>

              {adjustments.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  No mid-service scope adjustments were requested or recorded on Job #{dispute.jobId}.
                </div>
              ) : (
                <div className="space-y-3">
                  {adjustments.map((adj) => (
                    <div key={adj.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {adj.id}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900">{adj.title}</h4>
                        </div>
                        <span className="text-xs font-bold text-purple-700">
                          {adj.costAdjustment >= 0 ? `+₹${adj.costAdjustment}` : `-₹${Math.abs(adj.costAdjustment)}`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{adj.explanation}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200">
                        <span>Initiated by: {adj.initiatorName}</span>
                        <span>Status: <strong>{adj.status}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CHRONOLOGICAL CASE TIMELINE */}
          {activeTab === 'HISTORY' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Immutable event stream of all actions taken on Dispute #{dispute.id}.
              </p>
              <div className="divide-y divide-slate-100">
                {dispute.history.map((ev, i) => (
                  <div key={i} className="py-3 flex flex-col sm:flex-row sm:items-start justify-between gap-2 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {ev.action}
                        </span>
                        <span className="font-semibold text-slate-900">{ev.actorName}</span>
                        <span className="text-[11px] text-slate-400">({ev.actorRole})</span>
                      </div>
                      {ev.notes && (
                        <p className="text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                          {ev.notes}
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {new Date(ev.timestamp).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ARBITRATION DECISION ACTION FORM (Only active if not closed) */}
      {!isCaseClosed && (
        <Card className="border-2 border-red-200 shadow-sm">
          <CardHeader className="bg-red-50/50 border-b border-red-100 pb-4">
            <CardTitle className="text-base font-bold text-red-950 flex items-center gap-2">
              <Gavel className="w-5 h-5 text-red-700" />
              Administrative Arbitration Ruling
            </CardTitle>
            <CardDescription className="text-xs text-red-900/80">
              Select an impartial adjudication outcome. Once confirmed, this ruling executes the corresponding financial/service adjustment and closes the case.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-5">
            {/* 3 Mutually Exclusive Decision Choices */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                1. Select Arbitration Ruling <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Outcome 1: Full Refund */}
                <button
                  type="button"
                  onClick={() => setSelectedDecision('FULL_REFUND')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedDecision === 'FULL_REFUND'
                      ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-emerald-800">FULL REFUND</span>
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-xs text-slate-600">
                    Order a full refund of ₹{dispute.disputedAmount.toLocaleString('en-IN')} to the customer due to verified service defect.
                  </p>
                </button>

                {/* Outcome 2: Redo Service */}
                <button
                  type="button"
                  onClick={() => setSelectedDecision('REDO_SERVICE')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedDecision === 'REDO_SERVICE'
                      ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-blue-800">REDO SERVICE</span>
                    <FileCheck className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-xs text-slate-600">
                    Direct professional to return and rectify the defect at zero additional charge to customer within 48 hours.
                  </p>
                </button>

                {/* Outcome 3: Dismiss */}
                <button
                  type="button"
                  onClick={() => setSelectedDecision('DISMISS')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedDecision === 'DISMISS'
                      ? 'border-slate-700 bg-slate-100 ring-2 ring-slate-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800">DISMISS CLAIM</span>
                    <XCircle className="w-4 h-4 text-slate-600" />
                  </div>
                  <p className="text-xs text-slate-600">
                    Dismiss customer complaint in favor of contractor. Professional retains full payment for work delivered.
                  </p>
                </button>
              </div>
            </div>

            {/* Explanation Input */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                2. Mandatory Arbitration Explanation <span className="text-red-500">*</span> (min 10 characters)
              </label>
              <textarea
                rows={4}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="State the technical and policy reasons for this arbitration outcome. This statement will be visible to both customer and professional."
                className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                <span>Adjudication reasoning shared with all parties.</span>
                <span>{explanation.trim().length}/10 chars</span>
              </div>
            </div>

            {/* Internal Notes Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                3. Internal Administrative Notes (Optional)
              </label>
              <input
                type="text"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Private remarks for administrative record only..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="primary"
                size="md"
                onClick={handleOpenConfirmModal}
                disabled={!selectedDecision || explanation.trim().length < 10}
                className="bg-red-600 hover:bg-red-700 text-white text-xs px-6 py-2.5 flex items-center gap-2 shadow-2xs"
              >
                <Gavel className="w-4 h-4" />
                Submit Arbitration Ruling
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CONFIRMATION MODAL */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Formal Arbitration Ruling"
        description={`Execute binding resolution on Dispute #${dispute.id}.`}
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
              onClick={handleExecuteArbitration}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white text-xs flex items-center gap-1.5"
            >
              <Gavel className="w-3.5 h-3.5" />
              {isSubmitting ? 'Recording Ruling...' : 'Confirm & Execute Ruling'}
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs text-slate-700">
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-medium">
            Warning: This action is final and will be permanently recorded in the administrative audit log.
          </div>
          <div className="space-y-1">
            <p><strong>Case:</strong> {dispute.title}</p>
            <p><strong>Ruling:</strong> <span className="font-bold text-red-700">{selectedDecision}</span></p>
            <p><strong>Explanation:</strong> "{explanation}"</p>
            <p><strong>Arbitrator:</strong> {adminActor.name} ({adminActor.id})</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
