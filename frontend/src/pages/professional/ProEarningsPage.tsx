import { useEffect, useState } from 'react';
import { IndianRupee, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { apiJobAdapter } from '@/services/http/jobAdapter';
import { useAuth } from '@/context/AuthContext';
import type { Job } from '@/types/job';

export function ProEarningsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    apiJobAdapter
      .getJobs({ role: 'PROFESSIONAL', userId: user?.id })
      .then((list) => {
        if (mounted) setJobs(list);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const confirmedJobs = jobs.filter(
    (job) => job.status === 'CUSTOMER_CONFIRMED' || job.status === 'CLOSED',
  );
  const totalEarned = confirmedJobs.reduce((total, job) => total + job.currentAmount, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <IndianRupee className="w-5 h-5 text-emerald-600" /> Earnings
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Confirmed Earnings</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">₹{totalEarned.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Confirmed Jobs</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">{confirmedJobs.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-sm flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-600" /> Earnings History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="py-6 text-center text-sm text-slate-500">Loading earnings...</p>
          ) : confirmedJobs.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No confirmed earnings yet.</p>
          ) : (
            confirmedJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-200">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{job.title}</p>
                  <p className="text-xs text-slate-500">{job.customerName}</p>
                </div>
                <p className="text-sm font-bold text-emerald-700">₹{job.currentAmount.toLocaleString('en-IN')}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
