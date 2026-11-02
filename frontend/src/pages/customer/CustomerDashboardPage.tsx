import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { mockProblemAdapter } from '@/services/mockProblemAdapter';
import type { Problem, ProblemMetrics } from '@/types/problem';
import {
  PlusCircle,
  ArrowRight,
  Briefcase,
  FileQuestion,
  Sparkles,
  Clock,
  MapPin,
  CheckCircle2,
  Inbox,
  Eye,
} from 'lucide-react';

export function CustomerDashboardPage() {
  const { user } = useAuth();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [metrics, setMetrics] = useState<ProblemMetrics>({
    activeProblems: 0,
    incomingProposals: 0,
    jobsInProgress: 0,
    resolvedCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        const [loadedProblems, loadedMetrics] = await Promise.all([
          mockProblemAdapter.getProblems(user?.id),
          mockProblemAdapter.getProblemMetrics(user?.id),
        ]);

        if (isMounted) {
          setProblems(loadedProblems);
          setMetrics(loadedMetrics);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load customer dashboard data:', err);
          setIsLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const displayName = user?.name ? user.name.split(' ')[0] : 'Customer';

  // Format relative timestamp
  const formatTimeAgo = (isoDate: string): string => {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffHours = Math.floor(diffMs / (3600 * 1000));
    if (diffHours < 1) return 'Posted just now';
    if (diffHours === 1) return 'Posted 1 hour ago';
    if (diffHours < 24) return `Posted ${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Posted yesterday';
    return `Posted ${diffDays} days ago`;
  };

  const getStatusBadge = (status: Problem['status']) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            Open for Proposals
          </span>
        );
      case 'PROPOSALS_RECEIVED':
        return (
          <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            Comparing Proposals
          </span>
        );
      case 'PROFESSIONAL_SELECTED':
        return (
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Professional Selected
          </span>
        );
      case 'CLOSED':
        return (
          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            Closed
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/40 to-white border border-blue-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
            Customer Portal Hub
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            Welcome back, {displayName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
            You currently have{' '}
            <strong className="text-blue-700 font-semibold">
              {metrics.activeProblems} active problem {metrics.activeProblems === 1 ? 'request' : 'requests'}
            </strong>{' '}
            receiving proposals and{' '}
            <strong className="text-emerald-700 font-semibold">
              {metrics.jobsInProgress} job in progress
            </strong>
            .
          </p>
        </div>
        <Link to="/customer/problems/new">
          <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Post a New Problem
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200/90 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Active Requests</p>
              <p className="text-2xl font-bold text-slate-900 font-mono mt-0.5">
                {isLoading ? '...' : metrics.activeProblems}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <FileQuestion className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/90 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Proposals Received</p>
              <p className="text-2xl font-bold text-purple-700 font-mono mt-0.5">
                {isLoading ? '...' : metrics.incomingProposals}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <Sparkles className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/90 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Jobs in Progress</p>
              <p className="text-2xl font-bold text-emerald-700 font-mono mt-0.5">
                {isLoading ? '...' : metrics.jobsInProgress}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Briefcase className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/90 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Resolved Issues</p>
              <p className="text-2xl font-bold text-slate-700 font-mono mt-0.5">
                {isLoading ? '...' : metrics.resolvedCount}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Problems Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Recent Problem Requests</h2>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {problems.length}
            </span>
          </div>
          <Link to="/customer/problems" className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1">
            View All Problems <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            <Clock className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-xs font-medium">Loading your problem requests...</p>
          </div>
        ) : problems.length === 0 ? (
          /* Empty State */
          <Card className="bg-white border-slate-200/90 shadow-2xs">
            <CardContent className="p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 mx-auto flex items-center justify-center shadow-2xs">
                <Inbox className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">No Problem Requests Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  You haven&apos;t posted any repair or service issues yet. Describe your symptoms to receive bids from verified local professionals.
                </p>
              </div>
              <Link to="/customer/problems/new">
                <Button variant="primary" size="md" leftIcon={<PlusCircle className="w-4 h-4" />}>
                  Post Your First Problem
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {problems.map((p) => (
              <Card key={p.id} className="bg-white hover:border-blue-300 hover:shadow-card transition-all flex flex-col justify-between">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {p.id}
                    </span>
                    <Badge variant="urgency" urgency={p.urgency} />
                  </div>
                  <CardTitle className="text-sm mt-2 text-slate-900 font-bold leading-snug line-clamp-2">
                    {p.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                    <span>{p.category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {p.location.neighborhood}, {p.location.city}
                    </span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 pt-1 pb-3">
                  <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-200/90">
                    <span className="text-slate-700 flex items-center gap-1.5 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <strong>{p.proposalsCount} Proposals</strong> received
                    </span>
                    {getStatusBadge(p.status)}
                  </div>
                </CardContent>

                <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs mt-auto">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {formatTimeAgo(p.createdAt)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link to={`/customer/problems/${p.id}`}>
                      <Button variant="ghost" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                        Details
                      </Button>
                    </Link>
                    {p.proposalsCount > 0 && (
                      <Link to={`/customer/problems/${p.id}/compare`}>
                        <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3 h-3" />}>
                          Compare
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
