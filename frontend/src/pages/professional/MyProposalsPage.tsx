import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { mockProposalAdapter } from '@/services/mockProposalAdapter';
import { mockProblemAdapter } from '@/services/mockProblemAdapter';
import { mockQuoteRevisionAdapter } from '@/services/mockQuoteRevisionAdapter';
import { useAuth } from '@/context/AuthContext';
import type { Proposal, ProposalStatus } from '@/types/proposal';
import type { Problem } from '@/types/problem';
import type { Job } from '@/types/job';
import type { QuoteRevision } from '@/types/quoteRevision';
import {
  FileText,
  Clock,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Calendar,
  FileEdit,
  AlertCircle,
  Check,
  TrendingDown,
  X,
} from 'lucide-react';

interface ProposalItemWithProblem {
  proposal: Proposal;
  problem: Problem | null;
  associatedJob?: Job;
}

export function MyProposalsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<ProposalItemWithProblem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | ProposalStatus>('ALL');

  // Quote Revisions state
  const [revisions, setRevisions] = useState<QuoteRevision[]>([]);
  const [activeRevisionToSubmit, setActiveRevisionToSubmit] = useState<QuoteRevision | null>(null);
  const [revisedPrice, setRevisedPrice] = useState<number>(0);
  const [revisedDuration, setRevisedDuration] = useState('');
  const [revisedInclusions, setRevisedInclusions] = useState('');
  const [revisedExclusions, setRevisedExclusions] = useState('');
  const [revisedExplanation, setRevisedExplanation] = useState('');
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);
  const [revisionModalError, setRevisionModalError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const proId = user?.id || 'user-demo-pro';
        const [propsList, jobsList, revsList] = await Promise.all([
          mockProposalAdapter.getProposalsByProfessional(proId),
          mockProposalAdapter.getJobs(),
          mockQuoteRevisionAdapter.getRevisionsForProfessional(proId),
        ]);

        if (!isMounted) return;
        setRevisions(revsList);

        // Fetch corresponding problem records
        const combined: ProposalItemWithProblem[] = [];
        for (const prop of propsList) {
          const problem = await mockProblemAdapter.getProblemById(prop.problemId);
          const job = jobsList.find((j) => j.proposalId.toUpperCase() === prop.id.toUpperCase());
          combined.push({
            proposal: prop,
            problem,
            associatedJob: job,
          });
        }

        setItems(combined);
        setIsLoading(false);
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load submitted proposals:', err);
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleOpenSubmitRevisedQuote = (rev: QuoteRevision) => {
    setActiveRevisionToSubmit(rev);
    setRevisedPrice(rev.desiredBudget || rev.originalQuote.estimatedPrice);
    setRevisedDuration(rev.desiredDuration || rev.originalQuote.estimatedDuration);
    setRevisedInclusions(rev.originalQuote.includedServices.join(', '));
    setRevisedExclusions(rev.originalQuote.excludedServices.join(', '));
    setRevisedExplanation('');
    setRevisionModalError(null);
  };

  const handleSubmitRevisedQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRevisionToSubmit) return;
    if (!revisedPrice || revisedPrice <= 0) {
      setRevisionModalError('Please enter a valid revised price.');
      return;
    }
    if (!revisedExplanation.trim() || revisedExplanation.trim().length < 10) {
      setRevisionModalError('Please explain the modifications made (at least 10 characters).');
      return;
    }

    setIsSubmittingRevision(true);
    setRevisionModalError(null);

    try {
      await mockQuoteRevisionAdapter.submitRevisedQuote(
        {
          revisionId: activeRevisionToSubmit.id,
          revisedPrice: Number(revisedPrice),
          revisedDuration: revisedDuration.trim(),
          includedServices: revisedInclusions.split(',').map((s) => s.trim()).filter(Boolean),
          excludedServices: revisedExclusions.split(',').map((s) => s.trim()).filter(Boolean),
          explanation: revisedExplanation.trim(),
        },
        {
          id: user?.id || 'user-demo-pro',
          name: user?.name || 'Arun Kumar',
        }
      );
      // Reload proposals and revisions
      const proId = user?.id || 'user-demo-pro';
      const [propsList, revsList] = await Promise.all([
        mockProposalAdapter.getProposalsByProfessional(proId),
        mockQuoteRevisionAdapter.getRevisionsForProfessional(proId),
      ]);
      setRevisions(revsList);
      setItems((prev) =>
        prev.map((item) => {
          const updated = propsList.find((p) => p.id === item.proposal.id);
          return updated ? { ...item, proposal: updated } : item;
        })
      );
      setActiveRevisionToSubmit(null);
    } catch (err: any) {
      setRevisionModalError(err?.message || 'Failed to submit revised quote.');
    } finally {
      setIsSubmittingRevision(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-16 text-center text-slate-500 space-y-3">
        <Clock className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
        <p className="text-sm font-medium">Loading your submitted proposals...</p>
      </div>
    );
  }

  const filteredItems = items.filter((item) => {
    if (statusFilter === 'ALL') return true;
    return item.proposal.status === statusFilter;
  });

  const getStatusBadge = (status: ProposalStatus) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Proposal Accepted & Hired
          </span>
        );
      case 'SUBMITTED':
      case 'VIEWED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Under Customer Review
          </span>
        );
      case 'NOT_SELECTED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
            Another Quote Selected
          </span>
        );
      default:
        return (
          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {status}
          </span>
        );
    }
  };

  const totalCount = items.length;
  const acceptedCount = items.filter((i) => i.proposal.status === 'ACCEPTED').length;
  const pendingCount = items.filter(
    (i) => i.proposal.status === 'SUBMITTED' || i.proposal.status === 'VIEWED'
  ).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Submitted Proposals Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor the status of your structured estimates and access active job workspaces.
          </p>
        </div>

        <Link to="/pro/matching-problems">
          <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Browse Matching Leads
          </Button>
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-white border-slate-200 shadow-2xs">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Total Proposals
            </span>
            <span className="text-2xl font-bold text-slate-900 mt-0.5 block">{totalCount}</span>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-2xs">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Accepted / Hired
            </span>
            <span className="text-2xl font-bold text-emerald-600 mt-0.5 block">{acceptedCount}</span>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-2xs">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Pending Review
            </span>
            <span className="text-2xl font-bold text-blue-600 mt-0.5 block">{pendingCount}</span>
          </CardContent>
        </Card>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            statusFilter === 'ALL'
              ? 'bg-blue-50 text-blue-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Proposals ({totalCount})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('ACCEPTED')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            statusFilter === 'ACCEPTED'
              ? 'bg-emerald-50 text-emerald-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Accepted & Hired ({acceptedCount})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('SUBMITTED')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            statusFilter === 'SUBMITTED'
              ? 'bg-blue-50 text-blue-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Under Review ({pendingCount})
        </button>
      </div>

      {/* Proposals List */}
      {filteredItems.length === 0 ? (
        <Card className="bg-white border-slate-200 shadow-2xs p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Proposals Found</h3>
            <p className="text-xs text-slate-500">
              You haven&apos;t submitted any proposals under this filter.
            </p>
          </div>
          <Link to="/pro/matching-problems">
            <Button variant="primary" size="sm">
              Discover Matching Problems
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredItems.map(({ proposal, problem, associatedJob }) => (
            <Card
              key={proposal.id}
              className={`bg-white border transition-all ${
                proposal.status === 'ACCEPTED'
                  ? 'border-emerald-300 shadow-sm'
                  : 'border-slate-200 shadow-2xs'
              }`}
            >
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {proposal.id}
                      </span>
                      {getStatusBadge(proposal.status)}
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                        <Sparkles className="w-3 h-3" /> {proposal.matchScore.overall}% Match
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      {problem ? problem.title : `Problem #${proposal.problemId}`}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-1">
                      <strong>Diagnosis:</strong> {proposal.initialDiagnosis}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap pt-1">
                      <span className="font-bold text-slate-900 text-sm">
                        Quoted: ₹{proposal.estimatedPrice.toLocaleString()}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Arrival: {proposal.proposedVisitTime}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Duration: {proposal.estimatedDuration}
                      </span>
                    </div>

                    {/* Active Revision Banner (if any) */}
                    {(() => {
                      const revision = revisions.find(
                        (r) => r.proposalId.toUpperCase() === proposal.id.toUpperCase()
                      );
                      if (!revision) return null;

                      if (revision.status === 'PENDING') {
                        return (
                          <div className="mt-3 p-3.5 bg-amber-50/90 rounded-lg border border-amber-300 text-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-amber-900 flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-amber-600" />
                                Customer Requested Quote Revision
                              </span>
                              <span className="text-[10px] text-amber-700">
                                {new Date(revision.customerRequestedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-slate-800 bg-white/90 p-2.5 rounded border border-amber-200 leading-relaxed font-medium">
                              &ldquo;{revision.requestedChanges}&rdquo;
                            </p>
                            <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                              <div className="flex items-center gap-3 text-slate-600 text-[11px]">
                                {revision.desiredBudget && (
                                  <span>
                                    Desired Budget: <strong className="text-slate-900 font-mono">₹{revision.desiredBudget.toLocaleString()}</strong>
                                  </span>
                                )}
                                {revision.desiredDuration && (
                                  <span>
                                    Target Duration: <strong className="text-slate-900">{revision.desiredDuration}</strong>
                                  </span>
                                )}
                              </div>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleOpenSubmitRevisedQuote(revision)}
                                className="text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-2xs"
                                leftIcon={<FileEdit className="w-3.5 h-3.5" />}
                              >
                                Review & Submit Revised Quote
                              </Button>
                            </div>
                          </div>
                        );
                      }

                      if (revision.status === 'REVISED') {
                        return (
                          <div className="mt-2.5 p-2.5 bg-purple-50 rounded-lg border border-purple-200 text-xs flex items-center justify-between">
                            <span className="text-purple-900 font-semibold flex items-center gap-1.5">
                              <TrendingDown className="w-4 h-4 text-purple-600" />
                              Revised Quote Submitted: ₹{revision.revisedQuote?.estimatedPrice.toLocaleString()} (Awaiting Customer Acceptance)
                            </span>
                            <span className="text-[10px] text-purple-700 italic">
                              Version {revision.revisedQuote?.version}
                            </span>
                          </div>
                        );
                      }

                      if (revision.status === 'ACCEPTED') {
                        return (
                          <div className="mt-2.5 p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-emerald-600" />
                            Customer Accepted Revised Quote (₹{revision.revisedQuote?.estimatedPrice.toLocaleString()})
                          </div>
                        );
                      }

                      if (revision.status === 'DECLINED') {
                        return (
                          <div className="mt-2.5 p-2.5 bg-slate-100 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center gap-1.5">
                            <X className="w-4 h-4 text-slate-400" />
                            Customer Declined Revision ({revision.customerDecisionNote || 'No explanation provided'})
                          </div>
                        );
                      }

                      return null;
                    })()}
                  </div>

                  <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <Link to={`/pro/matching-problems/${proposal.problemId}`}>
                      <Button variant="outline" size="sm">
                        Inspect Problem
                      </Button>
                    </Link>

                    {proposal.status === 'ACCEPTED' && associatedJob && (
                      <Link to={`/jobs/${associatedJob.id}`}>
                        <Button
                          variant="primary"
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                        >
                          Open Workspace
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* SUBMIT REVISED QUOTE MODAL */}
      {activeRevisionToSubmit && (
        <Modal
          isOpen={!!activeRevisionToSubmit}
          onClose={() => !isSubmittingRevision && setActiveRevisionToSubmit(null)}
          title={`Submit Revised Quote to ${activeRevisionToSubmit.customerName}`}
          description="Update your pricing, scope inclusions, and estimated duration in response to the customer's request."
          size="lg"
        >
          <form onSubmit={handleSubmitRevisedQuote} className="space-y-4 text-xs">
            {revisionModalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{revisionModalError}</span>
              </div>
            )}

            {/* Customer Request Summary Box */}
            <div className="p-3.5 bg-amber-50 rounded-lg border border-amber-200 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-amber-800 block">
                Customer&apos;s Requested Revision:
              </span>
              <p className="text-slate-800 leading-relaxed font-medium">
                &ldquo;{activeRevisionToSubmit.requestedChanges}&rdquo;
              </p>
              <div className="flex items-center gap-4 text-[11px] text-amber-900 pt-1">
                {activeRevisionToSubmit.desiredBudget && (
                  <span>
                    Customer Desired Budget: <strong>₹{activeRevisionToSubmit.desiredBudget.toLocaleString()}</strong>
                  </span>
                )}
                {activeRevisionToSubmit.desiredDuration && (
                  <span>
                    Target Duration: <strong>{activeRevisionToSubmit.desiredDuration}</strong>
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Revised Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={revisedPrice}
                  onChange={(e) => setRevisedPrice(Number(e.target.value))}
                  placeholder="e.g. 1000"
                  className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Original quote was ₹{activeRevisionToSubmit.originalQuote.estimatedPrice.toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Revised Duration
                </label>
                <input
                  type="text"
                  value={revisedDuration}
                  onChange={(e) => setRevisedDuration(e.target.value)}
                  placeholder="e.g. 1.5 hours"
                  className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Included Services (Comma separated)
              </label>
              <textarea
                rows={2}
                value={revisedInclusions}
                onChange={(e) => setRevisedInclusions(e.target.value)}
                placeholder="e.g. Pipe inspection, Pressure test, Stopcock washer replacement"
                className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-hidden resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Excluded Services (Optional, comma separated)
              </label>
              <input
                type="text"
                value={revisedExclusions}
                onChange={(e) => setRevisedExclusions(e.target.value)}
                placeholder="e.g. Deep wall opening"
                className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Explanation of Changes <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={revisedExplanation}
                onChange={(e) => setRevisedExplanation(e.target.value)}
                placeholder="Explain clearly how this quote has been adjusted to address the customer's request..."
                className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-hidden resize-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActiveRevisionToSubmit(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSubmittingRevision}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                {isSubmittingRevision ? 'Submitting...' : 'Send Revised Quote to Customer'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
