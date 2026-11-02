import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { mockProblemAdapter } from '@/services/mockProblemAdapter';
import { mockProposalAdapter } from '@/services/mockProposalAdapter';
import { useAuth } from '@/context/AuthContext';
import type { Problem } from '@/types/problem';
import type { Proposal, MatchScoreBreakdown } from '@/types/proposal';
import type { Job } from '@/types/job';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Star,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Briefcase,
  DollarSign,
  Layers,
  LayoutGrid,
  ExternalLink,
  Info,
  Calendar,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

export function ProposalComparisonPage() {
  const { problemId } = useParams<{ problemId: string }>();
  const { user } = useAuth();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [associatedJob, setAssociatedJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // View mode: 'matrix' (side-by-side) or 'cards' (stacked)
  const [viewMode, setViewMode] = useState<'matrix' | 'cards'>('matrix');

  // Explain Match Score modal/popover
  const [activeScoreBreakdown, setActiveScoreBreakdown] = useState<{
    proName: string;
    breakdown: MatchScoreBreakdown;
  } | null>(null);

  // Selection Confirmation Modal state
  const [selectedProposalForConfirm, setSelectedProposalForConfirm] = useState<Proposal | null>(null);
  const [isSubmittingSelection, setIsSubmittingSelection] = useState(false);
  const [selectionSuccessJob, setSelectionSuccessJob] = useState<Job | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!problemId) return;
      try {
        const [prob, propsList, jobsList] = await Promise.all([
          mockProblemAdapter.getProblemById(problemId),
          mockProposalAdapter.getProposalsForProblem(problemId),
          mockProposalAdapter.getJobs(),
        ]);

        if (isMounted) {
          setProblem(prob);
          setProposals(propsList);
          const foundJob = jobsList.find((j) => j.problemId.toUpperCase() === problemId.toUpperCase());
          if (foundJob) {
            setAssociatedJob(foundJob);
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load proposal comparison data:', err);
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [problemId]);

  const handleConfirmSelection = async () => {
    if (!selectedProposalForConfirm || !problemId) return;

    setIsSubmittingSelection(true);
    try {
      const customer = {
        id: user?.id || 'user-demo-customer',
        name: user?.name || 'Customer User',
      };

      const result = await mockProposalAdapter.selectProposal(
        problemId,
        selectedProposalForConfirm.id,
        customer
      );

      setProposals(result.allProblemProposals);
      setAssociatedJob(result.job);
      setSelectionSuccessJob(result.job);

      // Refresh problem status
      const updatedProb = await mockProblemAdapter.getProblemById(problemId);
      if (updatedProb) {
        setProblem(updatedProb);
      }

      setSelectedProposalForConfirm(null);
    } catch (err) {
      console.error('Failed to select professional:', err);
    } finally {
      setIsSubmittingSelection(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-16 text-center text-slate-500 space-y-3">
        <Clock className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
        <p className="text-sm font-medium">Loading competitive proposals and matching scores...</p>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="max-w-md mx-auto p-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">Problem Not Found</h2>
          <p className="text-xs text-slate-500">
            Could not find problem request #{problemId}.
          </p>
        </div>
        <Link to="/customer/problems">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Problems Directory
          </Button>
        </Link>
      </div>
    );
  }

  const hasAcceptedProposal = proposals.some((p) => p.status === 'ACCEPTED');

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to={`/customer/problems/${problem.id}`}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Problem Request #{problem.id}
        </Link>

        {/* View Switcher */}
        {proposals.length > 0 && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">View:</span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('matrix')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  viewMode === 'matrix'
                    ? 'bg-blue-50 text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Side-by-Side</span> Matrix
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-blue-50 text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Stacked Cards</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Header Context Banner */}
      <Card className="bg-white border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                {problem.id}
              </span>
              <Badge variant="urgency" urgency={problem.urgency} />
              {hasAcceptedProposal ? (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Professional Selected
                </span>
              ) : (
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> {proposals.length} Proposals Received
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{problem.title}</h1>
            <p className="text-xs text-slate-500">
              {problem.category} • {problem.location.neighborhood}, {problem.location.city} • Preferred:{' '}
              {problem.preferredDate} ({problem.preferredTimeWindow})
            </p>
          </div>

          {hasAcceptedProposal && associatedJob && (
            <Link to={`/jobs/${associatedJob.id}`} className="shrink-0 w-full sm:w-auto">
              <Button
                variant="primary"
                size="md"
                rightIcon={<ChevronRight className="w-4 h-4" />}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
              >
                Open Job Workspace #{associatedJob.id}
              </Button>
            </Link>
          )}
        </div>
      </Card>

      {/* Success Notification if just hired */}
      {selectionSuccessJob && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start justify-between gap-3 shadow-2xs animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-emerald-950">
                Professional Successfully Selected & Hired!
              </h4>
              <p className="text-xs text-emerald-900 leading-relaxed">
                Your service contract has been generated under Job record{' '}
                <strong>#{selectionSuccessJob.id}</strong>. Exact address and coordinates have been
                securely unlocked in your private Job Workspace.
              </p>
            </div>
          </div>
          <Link to={`/jobs/${selectionSuccessJob.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-100/50 shrink-0"
            >
              Go to Workspace
            </Button>
          </Link>
        </div>
      )}

      {/* Empty State if 0 proposals */}
      {proposals.length === 0 && (
        <Card className="bg-white border-slate-200 shadow-2xs p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-bold text-slate-900">Matching Engine Active</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your problem request is actively broadcasting to verified technicians within your
              coverage radius. Verified contractors evaluate symptoms, equipment photos, and
              availability before submitting transparent quotes.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Link to="/customer/problems">
              <Button variant="outline" size="sm">
                View My Problems
              </Button>
            </Link>
            <Link to={`/customer/problems/${problem.id}`}>
              <Button variant="ghost" size="sm">
                Inspect Request Details
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* 1. SIDE-BY-SIDE COMPARISON MATRIX (Desktop Table) */}
      {proposals.length > 0 && viewMode === 'matrix' && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-elevated">
          <table className="w-full border-collapse min-w-[760px]">
            {/* Header / Professional Identity Row */}
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="p-4 text-left w-56 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Comparison Criteria
                </th>
                {proposals.map((prop) => (
                  <th
                    key={prop.id}
                    className={`p-4 text-left border-l border-slate-200 ${
                      prop.status === 'ACCEPTED' ? 'bg-emerald-50/50' : ''
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-slate-400">{prop.id}</span>
                        {prop.status === 'ACCEPTED' && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                            Selected
                          </span>
                        )}
                        {prop.status === 'NOT_SELECTED' && (
                          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            Not Selected
                          </span>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-slate-900">{prop.businessName || prop.professionalName}</h4>
                          {prop.verified && (
                            <span title="Verified Professional">
                              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{prop.professionalName}</p>
                      </div>

                      <Link
                        to={`/professionals/${prop.professionalId}`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors pt-0.5"
                      >
                        <span>View Public Profile</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {/* Row: Quoted Price */}
              <tr className="hover:bg-slate-50/40">
                <td className="p-4 font-bold text-slate-700 bg-slate-50/40 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Quoted Estimate
                </td>
                {proposals.map((prop) => (
                  <td
                    key={prop.id}
                    className={`p-4 border-l border-slate-200 ${
                      prop.status === 'ACCEPTED' ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    <div className="space-y-0.5">
                      <span className="text-xl font-extrabold text-slate-900">
                        ₹{prop.estimatedPrice.toLocaleString()}
                      </span>
                      <p className="text-[11px] text-slate-400">Total diagnostic & initial visit quote</p>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row: Match Score */}
              <tr className="hover:bg-slate-50/40">
                <td className="p-4 font-bold text-slate-700 bg-slate-50/40 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  SolveBid Match Score
                </td>
                {proposals.map((prop) => (
                  <td
                    key={prop.id}
                    className={`p-4 border-l border-slate-200 ${
                      prop.status === 'ACCEPTED' ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold text-xs">
                        <span>{prop.matchScore.overall}% Match</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveScoreBreakdown({
                            proName: prop.businessName || prop.professionalName,
                            breakdown: prop.matchScore,
                          })
                        }
                        className="text-slate-400 hover:text-purple-600 p-1 rounded hover:bg-purple-50 transition-colors cursor-pointer"
                        title="Explain Match Score Breakdown"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row: Arrival Time & Availability */}
              <tr className="hover:bg-slate-50/40">
                <td className="p-4 font-bold text-slate-700 bg-slate-50/40 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Proposed Arrival
                </td>
                {proposals.map((prop) => (
                  <td
                    key={prop.id}
                    className={`p-4 border-l border-slate-200 font-semibold text-slate-800 ${
                      prop.status === 'ACCEPTED' ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    {prop.proposedVisitTime}
                  </td>
                ))}
              </tr>

              {/* Row: Estimated Duration */}
              <tr className="hover:bg-slate-50/40">
                <td className="p-4 font-bold text-slate-700 bg-slate-50/40 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Estimated Duration
                </td>
                {proposals.map((prop) => (
                  <td
                    key={prop.id}
                    className={`p-4 border-l border-slate-200 text-slate-700 ${
                      prop.status === 'ACCEPTED' ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    {prop.estimatedDuration}
                  </td>
                ))}
              </tr>

              {/* Row: Reputation & Rating */}
              <tr className="hover:bg-slate-50/40">
                <td className="p-4 font-bold text-slate-700 bg-slate-50/40 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  Reputation & Jobs
                </td>
                {proposals.map((prop) => (
                  <td
                    key={prop.id}
                    className={`p-4 border-l border-slate-200 ${
                      prop.status === 'ACCEPTED' ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 font-bold text-slate-900">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                        <span>{prop.averageRating.toFixed(1)}</span>
                        <span className="text-slate-400 font-normal">/ 5.0</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {prop.completedJobsCount} confirmed jobs • {prop.experienceYears} yrs exp.
                      </p>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row: Initial Diagnostic Approach */}
              <tr className="hover:bg-slate-50/40">
                <td className="p-4 font-bold text-slate-700 bg-slate-50/40 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  Diagnostic Approach
                </td>
                {proposals.map((prop) => (
                  <td
                    key={prop.id}
                    className={`p-4 border-l border-slate-200 text-slate-700 leading-relaxed ${
                      prop.status === 'ACCEPTED' ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    {prop.initialDiagnosis}
                  </td>
                ))}
              </tr>

              {/* Row: Included Services */}
              <tr className="hover:bg-slate-50/40">
                <td className="p-4 font-bold text-slate-700 bg-slate-50/40 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Included Services
                </td>
                {proposals.map((prop) => (
                  <td
                    key={prop.id}
                    className={`p-4 border-l border-slate-200 ${
                      prop.status === 'ACCEPTED' ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    <ul className="space-y-1">
                      {prop.includedServices.map((inc, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>

              {/* Row: Excluded Services */}
              <tr className="hover:bg-slate-50/40">
                <td className="p-4 font-bold text-slate-700 bg-slate-50/40 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  Excluded Services
                </td>
                {proposals.map((prop) => (
                  <td
                    key={prop.id}
                    className={`p-4 border-l border-slate-200 ${
                      prop.status === 'ACCEPTED' ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    <ul className="space-y-1">
                      {prop.excludedServices.map((exc, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-slate-500">
                          <span className="text-red-400 font-bold shrink-0">•</span>
                          <span>{exc}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>

              {/* Row: Warranty / Workmanship Notes */}
              <tr className="hover:bg-slate-50/40">
                <td className="p-4 font-bold text-slate-700 bg-slate-50/40 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-500" />
                  Warranty & Terms
                </td>
                {proposals.map((prop) => (
                  <td
                    key={prop.id}
                    className={`p-4 border-l border-slate-200 text-[11px] text-slate-600 italic ${
                      prop.status === 'ACCEPTED' ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    {prop.notes || 'Standard terms apply.'}
                  </td>
                ))}
              </tr>

              {/* Row: Final Selection Action */}
              <tr className="bg-slate-50/80">
                <td className="p-4 font-bold text-slate-700">Selection Decision</td>
                {proposals.map((prop) => (
                  <td
                    key={prop.id}
                    className={`p-4 border-l border-slate-200 ${
                      prop.status === 'ACCEPTED' ? 'bg-emerald-50/50' : ''
                    }`}
                  >
                    {prop.status === 'ACCEPTED' ? (
                      <div className="space-y-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs w-full justify-center shadow-2xs">
                          <CheckCircle2 className="w-4 h-4" />
                          Hired Contractor
                        </span>
                        {associatedJob && (
                          <Link to={`/jobs/${associatedJob.id}`} className="block">
                            <Button variant="outline" size="sm" className="w-full text-xs">
                              Open Workspace
                            </Button>
                          </Link>
                        )}
                      </div>
                    ) : hasAcceptedProposal ? (
                      <span className="text-slate-400 font-medium text-xs block text-center py-2">
                        Another quote accepted
                      </span>
                    ) : (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => setSelectedProposalForConfirm(prop)}
                        className="w-full shadow-2xs"
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      >
                        Select Professional
                      </Button>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* 2. STACKED CARDS VIEW (Mobile / Card List) */}
      {proposals.length > 0 && viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {proposals.map((prop) => (
            <Card
              key={prop.id}
              className={`bg-white border transition-all ${
                prop.status === 'ACCEPTED'
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                  : 'border-slate-200 shadow-2xs hover:shadow-elevated'
              }`}
            >
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-400">{prop.id}</span>
                      {prop.verified && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      {prop.businessName || prop.professionalName}
                    </CardTitle>
                    <p className="text-xs text-slate-500">Contractor: {prop.professionalName}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-extrabold text-slate-900 block">
                      ₹{prop.estimatedPrice.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400">Total Quote</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4 text-xs">
                {/* Match Score & Rating Bar */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      {prop.matchScore.overall}% Match
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveScoreBreakdown({
                          proName: prop.businessName || prop.professionalName,
                          breakdown: prop.matchScore,
                        })
                      }
                      className="text-slate-400 hover:text-purple-600"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1 font-bold text-slate-900">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    <span>{prop.averageRating.toFixed(1)}</span>
                    <span className="text-slate-400 font-normal">({prop.completedJobsCount} jobs)</span>
                  </div>
                </div>

                {/* Arrival & Duration */}
                <div className="grid grid-cols-2 gap-3 text-slate-700">
                  <div className="p-2.5 rounded-lg bg-slate-50">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Proposed Visit</span>
                    <span className="font-semibold text-slate-900">{prop.proposedVisitTime}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Duration</span>
                    <span className="font-semibold text-slate-900">{prop.estimatedDuration}</span>
                  </div>
                </div>

                {/* Diagnostic Approach */}
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                    Diagnostic Approach
                  </span>
                  <p className="text-slate-700 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    {prop.initialDiagnosis}
                  </p>
                </div>

                {/* Inclusions */}
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                    Included Services
                  </span>
                  <ul className="space-y-1">
                    {prop.includedServices.map((inc, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <Link
                    to={`/professionals/${prop.professionalId}`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>View Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  {prop.status === 'ACCEPTED' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Hired
                    </span>
                  ) : hasAcceptedProposal ? (
                    <span className="text-slate-400 text-xs">Not Selected</span>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedProposalForConfirm(prop)}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Select Pro
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* MATCH SCORE EXPLAINABILITY MODAL */}
      {activeScoreBreakdown && (
        <Modal
          isOpen={!!activeScoreBreakdown}
          onClose={() => setActiveScoreBreakdown(null)}
          title="Explainable Match Score Breakdown"
          size="md"
        >
          <div className="space-y-5">
            <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-purple-950">
                    {activeScoreBreakdown.proName}
                  </h4>
                  <p className="text-[11px] text-purple-800">
                    Multivariate algorithmic match against problem criteria
                  </p>
                </div>
                <div className="text-xl font-extrabold text-purple-700">
                  {activeScoreBreakdown.breakdown.overall}%
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-700">Skill & Specialization Match (30% weight)</span>
                  <span className="text-slate-900 font-bold">{activeScoreBreakdown.breakdown.skillMatch}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-600 h-full rounded-full"
                    style={{ width: `${activeScoreBreakdown.breakdown.skillMatch}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-700">Proximity & Distance Match (25% weight)</span>
                  <span className="text-slate-900 font-bold">{activeScoreBreakdown.breakdown.distanceMatch}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${activeScoreBreakdown.breakdown.distanceMatch}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-700">Schedule & Availability Match (20% weight)</span>
                  <span className="text-slate-900 font-bold">{activeScoreBreakdown.breakdown.availabilityMatch}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${activeScoreBreakdown.breakdown.availabilityMatch}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-700">Customer Rating & Track Record (15% weight)</span>
                  <span className="text-slate-900 font-bold">{activeScoreBreakdown.breakdown.ratingMatch}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${activeScoreBreakdown.breakdown.ratingMatch}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-700">Response Speed Match (10% weight)</span>
                  <span className="text-slate-900 font-bold">{activeScoreBreakdown.breakdown.responseSpeedMatch}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${activeScoreBreakdown.breakdown.responseSpeedMatch}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
              SolveBid provides explainable match scoring so customers can evaluate technical fit,
              geographical proximity, and past confirmed performance without relying on low-ball price racing.
            </div>

            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setActiveScoreBreakdown(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* SELECTION CONFIRMATION MODAL (Task F) */}
      {selectedProposalForConfirm && (
        <Modal
          isOpen={!!selectedProposalForConfirm}
          onClose={() => !isSubmittingSelection && setSelectedProposalForConfirm(null)}
          title="Confirm Professional Selection & Hire"
          size="md"
        >
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    {selectedProposalForConfirm.businessName || selectedProposalForConfirm.professionalName}
                  </h4>
                  <p className="text-xs text-slate-500">Lead: {selectedProposalForConfirm.professionalName}</p>
                </div>
                {selectedProposalForConfirm.verified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/70 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Agreed Quote</span>
                  <span className="text-lg font-extrabold text-slate-900">
                    ₹{selectedProposalForConfirm.estimatedPrice.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Scheduled Arrival</span>
                  <span className="text-sm font-bold text-slate-800">
                    {selectedProposalForConfirm.proposedVisitTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Next Steps Explanation */}
            <div className="space-y-2 text-xs text-slate-600">
              <span className="font-bold text-slate-900 block">What happens when you confirm:</span>
              <ul className="space-y-1.5 pl-1">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Problem request advances to <strong>PROFESSIONAL_SELECTED</strong> status.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    A dedicated <strong>Shared Job Workspace</strong> will be provisioned for real-time tracking and chat.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Your exact street address will be securely unlocked exclusively for this contractor.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    No upfront payment is charged now. Payment is only settled after job completion and your explicit sign-off.
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                disabled={isSubmittingSelection}
                onClick={() => setSelectedProposalForConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                isLoading={isSubmittingSelection}
                onClick={handleConfirmSelection}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Confirm & Hire Professional
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
