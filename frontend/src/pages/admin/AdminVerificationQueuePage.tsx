import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { mockAdminAdapter } from '@/services/mockAdminAdapter';
import type { ProfessionalVerificationRecord } from '@/types/admin';
import type { VerificationStatus } from '@/types/common';
import {
  ShieldCheck,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
  Briefcase,
  MapPin,
  FileText,
  RotateCw,
} from 'lucide-react';

export function AdminVerificationQueuePage() {
  const [records, setRecords] = useState<ProfessionalVerificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const loadQueue = async () => {
    setIsLoading(true);
    try {
      const data = await mockAdminAdapter.getVerificationQueue();
      setRecords(data);
    } catch (err) {
      console.error('Failed to load verification queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.category) set.add(r.category);
    });
    return Array.from(set);
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // Status filter
      if (statusFilter !== 'ALL' && rec.status !== statusFilter) {
        return false;
      }
      // Category filter
      if (categoryFilter !== 'ALL' && rec.category !== categoryFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = rec.professionalName.toLowerCase().includes(q);
        const matchesBusiness = rec.businessName.toLowerCase().includes(q);
        const matchesCategory = rec.category.toLowerCase().includes(q);
        const matchesCity = rec.city.toLowerCase().includes(q);
        const matchesSkills = rec.skills.some((s) => s.toLowerCase().includes(q));
        const matchesId = rec.professionalId.toLowerCase().includes(q) || rec.id.toLowerCase().includes(q);
        if (!matchesName && !matchesBusiness && !matchesCategory && !matchesCity && !matchesSkills && !matchesId) {
          return false;
        }
      }
      return true;
    });
  }, [records, statusFilter, categoryFilter, searchQuery]);

  const statusCounts = useMemo(() => {
    return {
      ALL: records.length,
      PENDING_VERIFICATION: records.filter((r) => r.status === 'PENDING_VERIFICATION').length,
      VERIFIED: records.filter((r) => r.status === 'VERIFIED').length,
      REJECTED: records.filter((r) => r.status === 'REJECTED').length,
    };
  }, [records]);

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Verified
          </span>
        );
      case 'PENDING_VERIFICATION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            Pending Review
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50/40 to-white border border-purple-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
            Administrative Governance
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            Professional Verification Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Audit trade licenses, GST credentials, skill certifications, and identity proofs for onboarding professionals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadQueue}
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
            {(['ALL', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED'] as const).map((st) => {
              const isActive = statusFilter === st;
              const count = statusCounts[st] || 0;
              const labelMap: Record<string, string> = {
                ALL: 'All Professionals',
                PENDING_VERIFICATION: 'Pending Review',
                VERIFIED: 'Verified',
                REJECTED: 'Rejected',
              };
              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                  }`}
                >
                  <span>{labelMap[st]}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                      isActive ? 'bg-purple-800 text-purple-100' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search and Category Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, business, skill, city, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
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

            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                <option value="ALL">All Categories ({categories.length})</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Records List */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 space-y-3">
          <Clock className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
          <p className="text-sm font-medium">Loading verification queue...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <Card className="text-center p-12">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No Professionals Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            {searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL'
              ? 'No verification records match your active search and filter criteria.'
              : 'There are currently no professionals in the verification queue.'}
          </p>
          {(searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setCategoryFilter('ALL');
              }}
              className="mt-4 text-xs"
            >
              Reset Filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRecords.map((record) => {
            const verifiedDocsCount = record.documents.filter((d) => d.isVerified).length;

            return (
              <Card
                key={record.id}
                className="hover:border-purple-300 transition-all hover:shadow-2xs overflow-hidden"
              >
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Professional Info */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-bold text-slate-900">
                          {record.professionalName}
                        </h2>
                        <span className="text-xs text-slate-500">({record.businessName})</span>
                        {getStatusBadge(record.status)}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-medium text-purple-700">
                          <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                          {record.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {record.neighborhood}, {record.city}
                        </span>
                        <span>{record.experienceYears} Years Experience</span>
                        <span className="text-slate-400">•</span>
                        <span>
                          Applied:{' '}
                          {new Date(record.submittedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      {/* Skills Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {record.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Document Summary */}
                      <div className="flex items-center gap-3 pt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          {record.documents.length} Submitted Documents
                        </span>
                        <span>
                          ({verifiedDocsCount} verified / {record.documents.length - verifiedDocsCount} pending)
                        </span>
                        {record.currentDecision?.reason && (
                          <span className="italic text-slate-400 truncate max-w-xs">
                            Latest note: "{record.currentDecision.reason}"
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="shrink-0 flex sm:flex-col items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      <Link to={`/admin/verification/${record.professionalId}`}>
                        <Button
                          variant="primary"
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-4 py-2 flex items-center gap-1.5 shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspect Credentials
                        </Button>
                      </Link>
                      <span className="text-[11px] text-slate-400">ID: {record.id}</span>
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
