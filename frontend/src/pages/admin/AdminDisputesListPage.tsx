import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { mockDisputeAdapter } from '@/services/mockDisputeAdapter';
import type { Dispute, DisputeStatus, DisputePriority } from '@/types/dispute';
import {
  ShieldAlert,
  Search,
  RotateCw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Gavel,
  Briefcase,
  User,
  Eye,
} from 'lucide-react';

export function AdminDisputesListPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DisputeStatus | 'ALL'>('ALL');

  const loadDisputes = async () => {
    setIsLoading(true);
    try {
      const data = await mockDisputeAdapter.getDisputes();
      setDisputes(data);
    } catch (err) {
      console.error('Failed to load disputes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDisputes();
  }, []);

  const filteredDisputes = useMemo(() => {
    return disputes.filter((disp) => {
      if (statusFilter !== 'ALL' && disp.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = disp.id.toLowerCase().includes(q) || disp.jobId.toLowerCase().includes(q);
        const matchesCustomer = disp.customerName.toLowerCase().includes(q);
        const matchesPro = disp.professionalName.toLowerCase().includes(q) || (disp.businessName && disp.businessName.toLowerCase().includes(q));
        const matchesTitle = disp.title.toLowerCase().includes(q);
        const matchesCategory = disp.category.toLowerCase().includes(q);
        if (!matchesId && !matchesCustomer && !matchesPro && !matchesTitle && !matchesCategory) {
          return false;
        }
      }
      return true;
    });
  }, [disputes, statusFilter, searchQuery]);

  const statusCounts = useMemo(() => {
    return {
      ALL: disputes.length,
      OPEN: disputes.filter((d) => d.status === 'OPEN').length,
      UNDER_REVIEW: disputes.filter((d) => d.status === 'UNDER_REVIEW').length,
      RESOLVED: disputes.filter((d) => d.status === 'RESOLVED').length,
      DISMISSED: disputes.filter((d) => d.status === 'DISMISSED').length,
    };
  }, [disputes]);

  const getPriorityBadge = (priority: DisputePriority) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
            <AlertTriangle className="w-3 h-3 text-red-700 animate-bounce" />
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            LOW
          </span>
        );
    }
  };

  const getStatusBadge = (status: DisputeStatus) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            Open Dispute
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            Under Review
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Resolved
          </span>
        );
      case 'DISMISSED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
            Dismissed
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-red-50 via-rose-50/40 to-white border border-red-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">
            Arbitration & Governance
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            Dispute Arbitration Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Impartial adjudication of customer grievances, service quality failures, and financial refund claims.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDisputes}
            className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Refresh Queue
          </Button>
          <Link to="/admin/dashboard">
            <Button variant="ghost" size="sm" className="text-xs text-slate-600">
              Admin Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
            {(['ALL', 'OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'] as const).map((st) => {
              const isActive = statusFilter === st;
              const count = statusCounts[st] || 0;
              const labelMap: Record<string, string> = {
                ALL: 'All Disputes',
                OPEN: 'Open',
                UNDER_REVIEW: 'Under Review',
                RESOLVED: 'Resolved',
                DISMISSED: 'Dismissed',
              };
              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-red-600 text-white shadow-2xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                  }`}
                >
                  <span>{labelMap[st]}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                      isActive ? 'bg-red-800 text-red-100' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Dispute ID, Job ID, customer, professional, title, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Disputes List */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 space-y-3">
          <Clock className="w-8 h-8 text-red-600 animate-spin mx-auto" />
          <p className="text-sm font-medium">Loading dispute registry...</p>
        </div>
      ) : filteredDisputes.length === 0 ? (
        <Card className="text-center p-12">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No Disputes Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            {searchQuery || statusFilter !== 'ALL'
              ? 'No dispute cases match your current filter criteria.'
              : 'There are currently no reported disputes on the platform.'}
          </p>
          {(searchQuery || statusFilter !== 'ALL') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
              className="mt-4 text-xs"
            >
              Reset Filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredDisputes.map((disp) => {
            return (
              <Card
                key={disp.id}
                className="hover:border-red-300 transition-all hover:shadow-2xs overflow-hidden"
              >
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Dispute Info */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                          {disp.id}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">Job #{disp.jobId}</span>
                        {getPriorityBadge(disp.priority)}
                        {getStatusBadge(disp.status)}
                      </div>

                      <div>
                        <h2 className="text-base font-bold text-slate-900">{disp.title}</h2>
                        <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                          "{disp.customerComplaint}"
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
                        <span className="flex items-center gap-1 font-medium text-slate-800">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          Customer: {disp.customerName}
                        </span>
                        <span className="flex items-center gap-1 font-medium text-slate-800">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          Pro: {disp.professionalName} {disp.businessName ? `(${disp.businessName})` : ''}
                        </span>
                        <span className="font-semibold text-red-700">
                          Disputed: ₹{disp.disputedAmount.toLocaleString('en-IN')}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">
                          Opened: {new Date(disp.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      {disp.arbitrationDecision && (
                        <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>
                            Outcome: <strong>{disp.arbitrationDecision.decision}</strong> by {disp.arbitrationDecision.arbitratorName}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    <div className="shrink-0 flex sm:flex-col items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      <Link to={`/admin/disputes/${disp.id}`}>
                        <Button
                          variant="primary"
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white text-xs px-4 py-2 flex items-center gap-1.5 shadow-2xs"
                        >
                          <Gavel className="w-3.5 h-3.5" />
                          {disp.status === 'RESOLVED' || disp.status === 'DISMISSED'
                            ? 'Inspect Case Dossier'
                            : 'Arbitrate Case'}
                        </Button>
                      </Link>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Category: {disp.category.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
