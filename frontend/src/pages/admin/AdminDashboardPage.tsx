import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiFetch } from '@/lib/api';
import {
  ShieldCheck,
  Briefcase,
  ShieldAlert,
  FolderTree,
  ScrollText,
  Clock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export function AdminDashboardPage() {
  const [stats, setStats] = useState<{
    users: { customers: number; professionals: number };
    problems: { open: number };
    jobs: { active: number; completed: number };
    revenue: { grossRupees: number };
    pendingVerifications: number;
    openDisputes: number;
  } | null>(null);
  const [pendingVerifications, setPendingVerifications] = useState<Array<{
    professionalId: string;
    professionalName: string;
    businessName: string | null;
    skills: string[];
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        const [statsResponse, verificationResponse] = await Promise.all([
          apiFetch<{ data: { stats: typeof stats } }>('/api/v1/admin/stats'),
          apiFetch<{ data: { verifications: typeof pendingVerifications } }>(
            '/api/v1/admin/verifications?status=PENDING&pageSize=3',
          ),
        ]);

        if (isMounted) {
          setStats(statsResponse.data.stats);
          setPendingVerifications(verificationResponse.data.verifications);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load admin dashboard data:', err);
        if (isMounted) setIsLoading(false);
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-3">
        <Clock className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
        <p className="text-sm font-medium">Aggregating platform governance metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Title Banner */}
      <div className="p-6 rounded-2xl bg-linear-to-r from-purple-50 via-indigo-50/40 to-white border border-purple-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
            Governance & Analytics Console
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            Marketplace Health & Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
            Real-time platform oversight: professional verification queues, dispute arbitration, taxonomy, and audit logs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/verification">
            <Button
              variant="primary"
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-2xs"
            >
              Audit Pending Pros ({stats.pendingVerifications})
            </Button>
          </Link>
          <Link to="/admin/audit-logs">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ScrollText className="w-3.5 h-3.5" />}
            >
              Audit Logs
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200 shadow-2xs">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Total Customers</p>
            <p className="text-2xl font-bold text-blue-700 font-mono mt-1">
              {stats.users.customers.toLocaleString()}
            </p>
            <span className="text-[10px] text-slate-400">Registered platform clients</span>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-2xs">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Verified Professionals</p>
            <p className="text-2xl font-bold text-emerald-700 font-mono mt-1">
              {stats.users.professionals.toLocaleString()}
            </p>
            <span className="text-[10px] text-slate-400">Active verified contractors</span>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/30 shadow-2xs">
          <CardContent className="p-4">
            <p className="text-xs text-amber-800 font-medium">Pending Verifications</p>
            <p className="text-2xl font-bold text-amber-700 font-mono mt-1">
              {stats.pendingVerifications}
            </p>
            <span className="text-[10px] text-amber-800/80 font-medium">Awaiting credential review</span>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/30 shadow-2xs">
          <CardContent className="p-4">
            <p className="text-xs text-red-800 font-medium">Open Disputes</p>
            <p className="text-2xl font-bold text-red-700 font-mono mt-1">
              {stats.openDisputes}
            </p>
            <span className="text-[10px] text-red-800/80 font-medium">Requires arbitration decision</span>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics: Problems, Jobs, Revenue */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200 shadow-2xs">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Active Problems</p>
            <p className="text-xl font-bold text-slate-800 font-mono mt-1">{stats.problems.open}</p>
            <span className="text-[10px] text-slate-400">Comparing quotes / open</span>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-2xs">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Active Jobs</p>
            <p className="text-xl font-bold text-indigo-700 font-mono mt-1">{stats.jobs.active}</p>
            <span className="text-[10px] text-slate-400">Currently in progress</span>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-2xs">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Completed Jobs</p>
            <p className="text-xl font-bold text-emerald-700 font-mono mt-1">{stats.jobs.completed}</p>
            <span className="text-[10px] text-slate-400">Confirmed by customers</span>
          </CardContent>
        </Card>

        <Card className="bg-slate-50 border-slate-200 shadow-2xs">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium flex items-center justify-between">
              <span>Gross Revenue</span>
            </p>
            <p className="text-xl font-bold text-slate-800 font-mono mt-1">
              ₹{stats.revenue.grossRupees.toLocaleString()}
            </p>
            <span className="text-[10px] text-slate-400">Confirmed job value</span>
          </CardContent>
        </Card>
      </div>

      {/* Operational Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Queue Preview */}
        <Card className="bg-white border-slate-200 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2 border-b border-slate-100">
            <div>
              <CardTitle className="text-sm text-slate-900 font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                Pending Professional Verifications
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">Credential and background audit requests</CardDescription>
            </div>
            <Link to="/admin/verification" className="text-xs text-purple-700 hover:underline font-semibold flex items-center gap-1">
              <span>View All ({stats.pendingVerifications})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-4 pt-3 space-y-2.5">
            {pendingVerifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400 space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <p className="text-xs">All professional applications audited.</p>
              </div>
            ) : (
              pendingVerifications.map((pro) => (
                <div
                  key={pro.professionalId}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{pro.businessName || pro.professionalName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">#{pro.professionalId}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {pro.skills.length > 0
                        ? pro.skills.slice(0, 3).join(", ")
                        : "No listed skills"}
                    </p>
                  </div>
                  <Link to={`/admin/verification/${pro.professionalId}`}>
                    <Button variant="outline" size="sm" className="text-xs border-purple-200 text-purple-700 hover:bg-purple-50">
                      Inspect
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Disputes Summary */}
        <Card className="bg-white border-slate-200 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2 border-b border-slate-100">
            <div>
              <CardTitle className="text-sm text-slate-900 font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                Active Dispute Arbitration Queue
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">Customer-contractor escalated conflicts</CardDescription>
            </div>
            <Link to="/admin/disputes" className="text-xs text-red-700 hover:underline font-semibold flex items-center gap-1">
              <span>View All ({stats.openDisputes})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-4 pt-3 space-y-2.5">
            <div className="p-6 text-center text-slate-500 space-y-1">
              <ShieldAlert className="w-6 h-6 text-red-600 mx-auto" />
              <p className="text-xs">
                {stats.openDisputes} open dispute{stats.openDisputes === 1 ? "" : "s"} currently need review.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Cards to Governance Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <Link to="/admin/categories" className="block group">
          <Card className="bg-white hover:border-purple-300 transition-all p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <FolderTree className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-700">
                  Service Taxonomy & Skills
                </h4>
                <p className="text-[11px] text-slate-500">Manage categories, required certifications & symptom tags</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/admin/audit-logs" className="block group">
          <Card className="bg-white hover:border-purple-300 transition-all p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <ScrollText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                  Immutable Audit Trail
                </h4>
                <p className="text-[11px] text-slate-500">Inspect time-stamped administrative decisions</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/admin/jobs" className="block group">
          <Card className="bg-white hover:border-purple-300 transition-all p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                  Global Job Monitor
                </h4>
                <p className="text-[11px] text-slate-500">Live operational lifecycle and scope tracker</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
