import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { mockProblemAdapter } from '@/services/mockProblemAdapter';
import type { Problem, ProblemStatus } from '@/types/problem';
import {
  PlusCircle,
  Search,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  Eye,
  Inbox,
  X,
} from 'lucide-react';

type FilterTab = 'ALL' | 'OPEN' | 'PROPOSALS_RECEIVED' | 'PROFESSIONAL_SELECTED' | 'CLOSED';

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: 'ALL', label: 'All Requests' },
  { id: 'OPEN', label: 'Open' },
  { id: 'PROPOSALS_RECEIVED', label: 'Comparing Proposals' },
  { id: 'PROFESSIONAL_SELECTED', label: 'Professional Selected' },
  { id: 'CLOSED', label: 'Closed' },
];

export function CustomerProblemsListPage() {
  const { user } = useAuth();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchProblems() {
      try {
        const data = await mockProblemAdapter.getProblems(user?.id);
        if (isMounted) {
          setProblems(data);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load problems directory:', err);
          setIsLoading(false);
        }
      }
    }

    fetchProblems();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Compute counts for tab badges
  const tabCounts = useMemo(() => {
    return {
      ALL: problems.length,
      OPEN: problems.filter((p) => p.status === 'OPEN').length,
      PROPOSALS_RECEIVED: problems.filter((p) => p.status === 'PROPOSALS_RECEIVED').length,
      PROFESSIONAL_SELECTED: problems.filter((p) => p.status === 'PROFESSIONAL_SELECTED').length,
      CLOSED: problems.filter((p) => p.status === 'CLOSED').length,
    };
  }, [problems]);

  // Filtered problems list
  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      // Tab Status
      if (activeTab !== 'ALL' && p.status !== activeTab) {
        return false;
      }

      // Urgency Filter
      if (urgencyFilter !== 'ALL' && p.urgency !== urgencyFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        const matchCat = p.category.toLowerCase().includes(q);
        const matchArea = p.location.neighborhood.toLowerCase().includes(q);
        const matchCity = p.location.city.toLowerCase().includes(q);
        const matchId = p.id.toLowerCase().includes(q);
        return matchTitle || matchDesc || matchCat || matchArea || matchCity || matchId;
      }

      return true;
    });
  }, [problems, activeTab, urgencyFilter, searchQuery]);

  const formatTimeAgo = (isoDate: string): string => {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffHours = Math.floor(diffMs / (3600 * 1000));
    if (diffHours < 1) return 'Posted just now';
    if (diffHours === 1) return 'Posted 1 hour ago';
    if (diffHours < 24) return `Posted ${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Posted yesterday';
    return `Posted ${diffDays}d ago`;
  };

  const getStatusBadge = (status: ProblemStatus) => {
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

  const clearFilters = () => {
    setActiveTab('ALL');
    setSearchQuery('');
    setUrgencyFilter('ALL');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            My Posted Problems Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Filter, inspect, and track bids across all your service and repair requests.
          </p>
        </div>
        <Link to="/customer/problems/new">
          <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Post a New Problem
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex items-center gap-2 overflow-x-auto pb-px">
          {FILTER_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = tabCounts[tab.id];

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                  isActive
                    ? 'border-blue-600 text-blue-700 bg-blue-50/40 rounded-t-lg'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and Quick Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Input
            placeholder="Search problems by title, symptoms, area, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
            aria-label="Filter by urgency"
          >
            <option value="ALL">All Urgencies</option>
            <option value="NORMAL">Normal Priority</option>
            <option value="SOON">Soon (Priority)</option>
            <option value="URGENT">Urgent (Emergency)</option>
          </select>

          {(activeTab !== 'ALL' || searchQuery || urgencyFilter !== 'ALL') && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Problem Cards Directory */}
      {isLoading ? (
        <div className="p-16 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
          <Clock className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-xs font-medium">Loading problems directory...</p>
        </div>
      ) : filteredProblems.length === 0 ? (
        <Card className="bg-white border-slate-200 shadow-2xs">
          <CardContent className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
              <Inbox className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-800">No Matching Problems Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No problem requests match your active search terms or status filters.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredProblems.map((problem) => (
            <Card
              key={problem.id}
              className="bg-white hover:border-blue-300 hover:shadow-card transition-all"
            >
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {problem.id}
                    </span>
                    <Badge variant="urgency" urgency={problem.urgency} />
                    {getStatusBadge(problem.status)}
                    <span className="text-[11px] text-slate-400 font-medium">
                      • {formatTimeAgo(problem.createdAt)}
                    </span>
                  </div>

                  <Link to={`/customer/problems/${problem.id}`}>
                    <h2 className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors">
                      {problem.title}
                    </h2>
                  </Link>

                  <p className="text-xs text-slate-600 line-clamp-2 max-w-2xl leading-relaxed">
                    {problem.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap pt-1">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700">
                      {problem.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {problem.location.neighborhood}, {problem.location.city}
                    </span>
                    <span className="text-purple-700 font-semibold flex items-center gap-1 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5" />
                      {problem.proposalsCount} {problem.proposalsCount === 1 ? 'Proposal' : 'Proposals'}
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <Link to={`/customer/problems/${problem.id}`} className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-36"
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                    >
                      View Details
                    </Button>
                  </Link>
                  {problem.proposalsCount > 0 && (
                    <Link to={`/customer/problems/${problem.id}/compare`} className="w-full sm:w-auto">
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full sm:w-36 shadow-2xs"
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      >
                        Compare Quotes
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
  );
}
