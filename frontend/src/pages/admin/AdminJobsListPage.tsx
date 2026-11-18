import { useEffect, useState } from 'react';
import { Search, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { apiFetch } from '@/lib/api';

interface AdminJob {
  id: string;
  title: string;
  status: string;
  customer: { name: string };
  professional: { name: string };
}

export function AdminJobsListPage() {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    apiFetch<{ data: { jobs: AdminJob[] } }>('/api/v1/jobs?pageSize=50')
      .then((response) => { if (mounted) setJobs(response.data.jobs); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const filtered = jobs.filter((job) => `${job.title} ${job.customer.name} ${job.professional.name}`.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <div className="space-y-5">
      <div><h1 className="text-xl font-bold text-slate-900">Jobs Monitor</h1><p className="text-xs text-slate-500 mt-1">Current and historical marketplace jobs.</p></div>
      <div className="relative"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search jobs" className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg" /></div>
      <Card>
        <CardHeader className="border-b border-slate-100"><CardTitle className="flex items-center gap-2 text-sm"><Briefcase className="w-4 h-4" /> Jobs</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <p className="py-6 text-center text-sm text-slate-500">Loading jobs...</p>
          ) : filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No jobs found.</p>
          ) : filtered.map((job) => (
            <Link key={job.id} to={`/jobs/${job.id}`} className="block p-3 border border-slate-200 rounded-lg hover:border-purple-300">
              <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-slate-900">{job.title}</p><p className="text-xs text-slate-500 mt-1">{job.customer.name} • {job.professional.name}</p></div><span className="text-xs px-2 py-1 rounded border border-slate-200">{job.status.replace(/_/g, ' ')}</span></div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
