import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { mockAdminAdapter } from '@/services/mockAdminAdapter';
import type { ProfessionalVerificationRecord, VerificationDocument } from '@/types/admin';
import type { VerificationStatus } from '@/types/common';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Award,
  ExternalLink,
  History,
  FileSearch,
} from 'lucide-react';

export function AdminVerificationDetailPage() {
  const { proId } = useParams<{ proId: string }>();
  const { user } = useAuth();

  const [record, setRecord] = useState<ProfessionalVerificationRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modals state
  const [activeDocPreview, setActiveDocPreview] = useState<VerificationDocument | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isRequestInfoModalOpen, setIsRequestInfoModalOpen] = useState(false);

  // Action inputs
  const [rejectReason, setRejectReason] = useState('');
  const [requestNotes, setRequestNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadRecord = async () => {
    if (!proId) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await mockAdminAdapter.getVerificationRecord(proId);
      if (!data) {
        setErrorMessage(`No verification record found for professional ID: ${proId}`);
      } else {
        setRecord(data);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load professional verification record.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecord();
  }, [proId]);

  const adminActor = {
    id: user?.id || 'admin-system',
    name: user?.name || 'Administrator',
  };

  const handleApprove = async () => {
    if (!record) return;
    setActionLoading(true);
    try {
      const updated = await mockAdminAdapter.approveVerification(record.professionalId, adminActor);
      setRecord(updated);
      setIsApproveModalOpen(false);
      setSuccessMessage(`Professional ${updated.professionalName} has been verified successfully. "Verified Professional" badge is now active.`);
    } catch (err: any) {
      alert(err.message || 'Failed to approve verification.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!record) return;
    if (rejectReason.trim().length < 10) {
      alert('Please provide a descriptive reason for rejection (at least 10 characters).');
      return;
    }
    setActionLoading(true);
    try {
      const updated = await mockAdminAdapter.rejectVerification(record.professionalId, rejectReason, adminActor);
      setRecord(updated);
      setIsRejectModalOpen(false);
      setRejectReason('');
      setSuccessMessage(`Verification application rejected. Reason logged in audit trail.`);
    } catch (err: any) {
      alert(err.message || 'Failed to reject verification.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestInfo = async () => {
    if (!record) return;
    if (requestNotes.trim().length < 10) {
      alert('Please specify the documents or clarifications needed (at least 10 characters).');
      return;
    }
    setActionLoading(true);
    try {
      const updated = await mockAdminAdapter.requestVerificationInfo(record.professionalId, requestNotes, adminActor);
      setRecord(updated);
      setIsRequestInfoModalOpen(false);
      setRequestNotes('');
      setSuccessMessage(`Information request recorded and logged in applicant history.`);
    } catch (err: any) {
      alert(err.message || 'Failed to request additional information.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Verified Professional
          </span>
        );
      case 'PENDING_VERIFICATION':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
            Pending Administrative Review
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-4 h-4 text-red-600" />
            Application Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <HelpCircle className="w-4 h-4 text-slate-500" />
            {status}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center text-slate-500 space-y-3">
        <Clock className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
        <p className="text-sm font-medium">Loading verification dossier...</p>
      </div>
    );
  }

  if (errorMessage || !record) {
    return (
      <div className="space-y-6">
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-800">
          <h2 className="text-base font-bold">Record Not Found</h2>
          <p className="text-xs mt-1">{errorMessage || 'Professional verification record could not be located.'}</p>
          <Link to="/admin/verification" className="inline-block mt-4">
            <Button variant="outline" size="sm" className="text-xs">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Return to Verification Queue
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/verification"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-purple-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Verification Queue
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Record ID: {record.id}</span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-400">Pro ID: {record.professionalId}</span>
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

      {/* Header Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{record.professionalName}</h1>
                <span className="text-base text-slate-500 font-medium">({record.businessName})</span>
                {getStatusBadge(record.status)}
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600 pt-1">
                <span className="flex items-center gap-1.5 font-semibold text-purple-700">
                  <Briefcase className="w-4 h-4 text-purple-600" />
                  {record.category}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {record.neighborhood}, {record.city}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {record.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {record.phone}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Submitted: {new Date(record.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                <span className="text-xs font-medium text-slate-500 mr-1">Skills:</span>
                {record.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200/60"
                  >
                    {skill}
                  </span>
                ))}
                <span className="px-2 py-0.5 text-xs text-slate-500 font-medium ml-2">
                  • {record.experienceYears} Years Experience
                </span>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="shrink-0 flex flex-col gap-2 sm:min-w-[200px] border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Administrative Actions
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsApproveModalOpen(true)}
                disabled={record.status === 'VERIFIED'}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {record.status === 'VERIFIED' ? 'Already Verified' : 'Approve Credentials'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRequestInfoModalOpen(true)}
                className="w-full text-xs border-amber-300 text-amber-800 hover:bg-amber-50 flex items-center justify-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                Request Information
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRejectModalOpen(true)}
                disabled={record.status === 'REJECTED'}
                className="w-full text-xs border-red-300 text-red-700 hover:bg-red-50 flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5 text-red-600" />
                Reject Submission
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submitted Documents Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-purple-600" />
              Uploaded Credentials & Trade Proofs ({record.documents.length})
            </h2>
            <p className="text-xs text-slate-500">
              Inspect government identity numbers, licensing authorities, and validity dates.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {record.documents.map((doc) => (
            <Card key={doc.id} className="hover:border-purple-300 transition-all shadow-2xs">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                      {doc.type.replace(/_/g, ' ')}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">{doc.title}</h3>
                  </div>
                  {doc.isVerified ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Verified
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      Unverified
                    </span>
                  )}
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Document No:</span>
                    <span className="font-mono font-medium text-slate-800">{doc.documentNumber}</span>
                  </div>
                  {doc.issuedBy && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Issued By:</span>
                      <span className="text-slate-700">{doc.issuedBy}</span>
                    </div>
                  )}
                  {doc.validUntil && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Valid Until:</span>
                      <span className="text-slate-700">{doc.validUntil}</span>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveDocPreview(doc)}
                  className="w-full text-xs flex items-center justify-center gap-1.5 text-purple-700 border-purple-200 hover:bg-purple-50"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View High-Res Document
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Decision Audit Trail */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-purple-600" />
            Administrative Decision Log & Audit History
          </CardTitle>
          <CardDescription className="text-xs">
            Chronological audit log of all administrative actions taken for this candidate.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {record.history.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No previous administrative decisions recorded. This application is awaiting initial review.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {record.history.map((log, idx) => (
                <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-start justify-between gap-2 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.action === 'APPROVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : log.action === 'REJECT'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {log.action}
                      </span>
                      <span className="font-semibold text-slate-800">{log.adminName}</span>
                      <span className="text-slate-400">(ID: {log.adminId})</span>
                    </div>
                    {log.reason && (
                      <p className="text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-100 mt-1">
                        "{log.reason}"
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {new Date(log.timestamp).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* DOCUMENT PREVIEW MODAL */}
      {activeDocPreview && (
        <Modal
          isOpen={!!activeDocPreview}
          onClose={() => setActiveDocPreview(null)}
          title={`Document Dossier: ${activeDocPreview.title}`}
          description={`Type: ${activeDocPreview.type} • ID: ${activeDocPreview.documentNumber}`}
          size="lg"
          footer={
            <Button variant="outline" size="sm" onClick={() => setActiveDocPreview(null)} className="text-xs">
              Close Viewer
            </Button>
          }
        >
          <div className="space-y-4">
            {/* Simulated Document Viewer Canvas */}
            <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-8 bg-slate-50/70 text-center min-h-[260px] flex flex-col items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center select-none font-bold text-6xl text-slate-900 rotate-[-15deg]">
                SOLVEBID VERIFIED
              </div>
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3 shadow-2xs">
                <Award className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-900">{activeDocPreview.title}</h4>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Ref #{activeDocPreview.documentNumber}
              </p>
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-700">
                <span>Issued by: {activeDocPreview.issuedBy || 'Official Authority'}</span>
                {activeDocPreview.validUntil && <span>• Expires: {activeDocPreview.validUntil}</span>}
              </div>
              <p className="text-[11px] text-slate-400 mt-4 max-w-sm">
                [Simulated High-Resolution Electronic Document Preview. Watermarked by SolveBid Administrative Security Engine.]
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* APPROVE CONFIRMATION MODAL */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Approve Professional Verification"
        description={`Grant official "Verified Professional" status to ${record.professionalName}.`}
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsApproveModalOpen(false)}
              disabled={actionLoading}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleApprove}
              disabled={actionLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {actionLoading ? 'Approving...' : 'Confirm Approval & Grant Badge'}
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs text-slate-600">
          <p>
            By approving this application, <strong>{record.professionalName}</strong> ({record.businessName}) will receive:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-700">
            <li>The official <strong>Verified Professional</strong> badge across all proposals and search results.</li>
            <li>Promoted matching weight in the SolveBid Matching Engine.</li>
            <li>Immediate authorization to submit proposals on high-value and urgent customer problems.</li>
          </ul>
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
            This action will be logged in the immutable administrative audit trail with your Administrator ID (<strong>{adminActor.name}</strong>).
          </div>
        </div>
      </Modal>

      {/* REJECT MODAL */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Verification Application"
        description={`Decline onboarding credentials for ${record.professionalName}.`}
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRejectModalOpen(false)}
              disabled={actionLoading}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleReject}
              disabled={actionLoading || rejectReason.trim().length < 10}
              className="bg-red-600 hover:bg-red-700 text-white text-xs flex items-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              {actionLoading ? 'Rejecting...' : 'Reject Application'}
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-600">
            Please provide an explicit reason explaining why the submitted credentials do not meet platform verification standards.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Rejection Reason <span className="text-red-500">*</span> (min 10 characters)
            </label>
            <textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Trade license expired on 2023-10-15 and GST number does not match registered business name."
              className="w-full p-2.5 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
              <span>Reason will be saved to applicant dossier and audit log.</span>
              <span>{rejectReason.trim().length}/10 chars</span>
            </div>
          </div>
        </div>
      </Modal>

      {/* REQUEST INFORMATION MODAL */}
      <Modal
        isOpen={isRequestInfoModalOpen}
        onClose={() => setIsRequestInfoModalOpen(false)}
        title="Request Additional Documentation"
        description={`Instruct ${record.professionalName} to supply further documentation or clarifications.`}
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRequestInfoModalOpen(false)}
              disabled={actionLoading}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleRequestInfo}
              disabled={actionLoading || requestNotes.trim().length < 10}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {actionLoading ? 'Submitting...' : 'Send Information Request'}
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-600">
            Specify the missing licenses, clearer scans, or specific certifications required to proceed with verification.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Instructions for Applicant <span className="text-amber-500">*</span> (min 10 characters)
            </label>
            <textarea
              rows={4}
              value={requestNotes}
              onChange={(e) => setRequestNotes(e.target.value)}
              placeholder="e.g., Please upload a clearer scan of the trade license showing the official stamp and seal."
              className="w-full p-2.5 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
              <span>Request will be appended to the applicant's history.</span>
              <span>{requestNotes.trim().length}/10 chars</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
