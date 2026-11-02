import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { mockProposalAdapter } from '@/services/mockProposalAdapter';
import { mockProblemAdapter } from '@/services/mockProblemAdapter';
import { useAuth } from '@/context/AuthContext';
import type { Proposal, ProposalStatus } from '@/types/proposal';
import type { Problem } from '@/types/problem';
import type { Job } from '@/types/job';
import {
  FileText,
  Clock,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Calendar,
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

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const proId = user?.id || 'user-demo-pro';
        const [propsList, jobsList] = await Promise.all([
          mockProposalAdapter.getProposalsByProfessional(proId),
          mockProposalAdapter.getJobs(),
        ]);

        if (!isMounted) return;

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
    </div>
  );
}
