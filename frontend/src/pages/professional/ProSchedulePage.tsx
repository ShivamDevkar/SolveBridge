import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { apiJobAdapter } from '@/services/http/jobAdapter';
import { useAuth } from '@/context/AuthContext';
import type { Job } from '@/types/job';

export function ProSchedulePage() {
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

  const scheduledJobs = jobs.filter((job) =>
    ['SCHEDULED', 'ON_THE_WAY', 'ARRIVED', 'INSPECTION', 'IN_PROGRESS'].includes(job.status),
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" /> Schedule
        </h1>
        <p className="text-xs text-slate-500 mt-1">Upcoming and active service appointments.</p>
      </div>

      <Card>
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-sm">Appointments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="py-6 text-center text-sm text-slate-500">Loading schedule...</p>
          ) : scheduledJobs.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No upcoming appointments.</p>
          ) : (
            scheduledJobs.map((job) => (
              <div key={job.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                <div>
                  <p className="text-sm font-bold text-slate-900">{job.title}</p>
                  <p className="text-xs text-slate-600 mt-1">{job.customerName}</p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {job.scheduledAt}
                  </p>
                </div>
                <Link to={`/jobs/${job.id}`} className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                  Open Job <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
