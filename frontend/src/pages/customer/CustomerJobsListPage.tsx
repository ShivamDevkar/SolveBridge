import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { apiJobAdapter } from '@/services/http/jobAdapter';
import type { Job, JobLifecycleStatus } from '@/types/job';
import {
  Wrench,
  Clock,
  Calendar,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  PlusCircle,
  MessageSquare,
} from 'lucide-react';

export function CustomerJobsListPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');

  useEffect(() => {
    let isMounted = true;

    async function loadJobs() {
      try {
        const list = await apiJobAdapter.getJobs({
          role: 'CUSTOMER',
          userId: user?.id,
        });
        if (isMounted) {
          setJobs(list);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load customer jobs:', err);
        if (isMounted) setIsLoading(false);
      }
    }

    loadJobs();
    return () => {
      isMounted = false;
    };
  }, [user]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-12 text-center text-slate-500 space-y-3">
        <Clock className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
        <p className="text-sm font-medium">Loading your service jobs...</p>
      </div>
    );
  }

  const filteredJobs = jobs.filter((job) => {
    if (filterTab === 'ALL') return true;
    if (filterTab === 'ACTIVE') {
      return (
        job.status === 'SCHEDULED' ||
        job.status === 'ON_THE_WAY' ||
        job.status === 'ARRIVED' ||
        job.status === 'INSPECTION' ||
        job.status === 'IN_PROGRESS' ||
        job.status === 'COMPLETED' ||
        job.status === 'DISPUTED'
      );
    }
    if (filterTab === 'RESOLVED') {
      return job.status === 'CUSTOMER_CONFIRMED' || job.status === 'CLOSED';
    }
    return true;
  });

  const getStatusBadge = (status: JobLifecycleStatus) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
            In Progress
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            Scheduled
          </span>
        );
      case 'ON_THE_WAY':
        return (
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            On The Way
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
            Completion Requested
          </span>
        );
      case 'CUSTOMER_CONFIRMED':
      case 'CLOSED':
        return (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      case 'DISPUTED':
        return (
          <span className="text-xs font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
            Disputed
          </span>
        );
      default:
        return (
          <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
            {status}
          </span>
        );
    }
  };

  const activeCount = jobs.filter(
    (j) =>
      j.status === 'SCHEDULED' ||
      j.status === 'ON_THE_WAY' ||
      j.status === 'ARRIVED' ||
      j.status === 'INSPECTION' ||
      j.status === 'IN_PROGRESS' ||
      j.status === 'COMPLETED' ||
      j.status === 'DISPUTED'
  ).length;

  const resolvedCount = jobs.filter(
    (j) => j.status === 'CUSTOMER_CONFIRMED' || j.status === 'CLOSED'
  ).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Wrench className="w-6 h-6 text-blue-600" />
            Accepted Jobs Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track active service execution, scheduled appointments, and verified completion history.
          </p>
        </div>

        <Link to="/customer/problems/new">
          <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
            Post a Problem
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setFilterTab('ALL')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            filterTab === 'ALL'
              ? 'bg-blue-50 text-blue-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Jobs ({jobs.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab('ACTIVE')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            filterTab === 'ACTIVE'
              ? 'bg-blue-50 text-blue-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Active Engagements ({activeCount})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab('RESOLVED')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            filterTab === 'RESOLVED'
              ? 'bg-emerald-50 text-emerald-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Confirmed & Resolved ({resolvedCount})
        </button>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <Card className="bg-white border-slate-200 shadow-2xs p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Wrench className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Jobs Found</h3>
            <p className="text-xs text-slate-500">
              You do not have any service jobs matching this view.
            </p>
          </div>
          <Link to="/customer/problems">
            <Button variant="outline" size="sm">
              View Problem Requests
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((j) => (
            <Card
              key={j.id}
              className="bg-white border border-slate-200 shadow-2xs hover:shadow-elevated transition-all"
            >
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        #{j.id}
                      </span>
                      {getStatusBadge(j.status)}
                      <span className="text-xs text-slate-500">
                        Problem Ref: <strong className="font-mono text-slate-700">#{j.problemId}</strong>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{j.title}</h3>

                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap pt-0.5">
                      <span className="flex items-center gap-1 font-semibold text-slate-800">
                        Contractor: {j.professionalName}
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Slot: {j.scheduledAt}
                      </span>
                      <span>•</span>
                      <span className="font-bold text-slate-900 text-sm">
                        ₹{j.currentAmount.toLocaleString()}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{j.exactServiceAddress}</span>
                    </p>
                  </div>

                  <div className="shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex flex-col sm:flex-row items-center gap-2">
                    <Link to={`/jobs/${j.id}/chat`} className="w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="md"
                        leftIcon={<MessageSquare className="w-4 h-4 text-blue-600" />}
                        className="w-full sm:w-auto text-xs"
                      >
                        Chat
                      </Button>
                    </Link>
                    <Link to={`/jobs/${j.id}`} className="w-full sm:w-auto">
                      <Button
                        variant="primary"
                        size="md"
                        rightIcon={<ChevronRight className="w-4 h-4" />}
                        className="w-full sm:w-auto shadow-2xs text-xs"
                      >
                        Workspace
                      </Button>
                    </Link>
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
