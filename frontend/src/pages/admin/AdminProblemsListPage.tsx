import { useEffect, useState } from 'react';
import { Search, FileQuestion } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { apiFetch } from '@/lib/api';

interface AdminProblem {
  id: string;
  title: string;
  description: string;
  status: string;
  category: { name: string };
  customerName: string;
}

export function AdminProblemsListPage() {
  const [problems, setProblems] = useState<AdminProblem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    apiFetch<{ data: { problems: AdminProblem[] } }>('/api/v1/problems?pageSize=50')
      .then((response) => { if (mounted) setProblems(response.data.problems); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const filtered = problems.filter((problem) => `${problem.title} ${problem.description} ${problem.customerName}`.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <div className="space-y-5">
      <div><h1 className="text-xl font-bold text-slate-900">Problem Oversight</h1><p className="text-xs text-slate-500 mt-1">Customer problem requests across the marketplace.</p></div>
      <div className="relative"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search problems" className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg" /></div>
      <Card>
        <CardHeader className="border-b border-slate-100"><CardTitle className="flex items-center gap-2 text-sm"><FileQuestion className="w-4 h-4" /> Problem Requests</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {loading ? <p className="py-6 text-center text-sm text-slate-500">Loading problems...</p> : filtered.length === 0 ? <p className="py-6 text-center text-sm text-slate-500">No problems found.</p> : filtered.map((problem) => (
            <div key={problem.id} className="p-3 border border-slate-200 rounded-lg">
              <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-slate-900">{problem.title}</p><p className="text-xs text-slate-500 mt-1">{problem.category?.name || 'Uncategorized'} • {problem.customerName}</p></div><span className="text-xs px-2 py-1 rounded border border-slate-200">{problem.status}</span></div>
              <p className="text-xs text-slate-600 mt-2 line-clamp-2">{problem.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
