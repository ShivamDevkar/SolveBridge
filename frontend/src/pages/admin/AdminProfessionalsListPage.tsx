import { useEffect, useState } from 'react';
import { Search, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { apiFetch } from '@/lib/api';

interface Professional {
  professionalId: string;
  professionalName: string;
  businessName: string | null;
  verificationStatus: string;
  experienceYears: number;
  skills: string[];
}

export function AdminProfessionalsListPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    apiFetch<{ data: { verifications: Professional[] } }>('/api/v1/admin/verifications?pageSize=100')
      .then((response) => { if (mounted) setProfessionals(response.data.verifications); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const filtered = professionals.filter((professional) => {
    const query = search.trim().toLowerCase();
    return !query || `${professional.professionalName} ${professional.businessName || ''}`.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-5">
      <div><h1 className="text-xl font-bold text-slate-900">Professionals Directory</h1><p className="text-xs text-slate-500 mt-1">Registered professionals and verification status.</p></div>
      <div className="relative"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search professionals" className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg" /></div>
      <Card>
        <CardHeader className="border-b border-slate-100"><CardTitle className="flex items-center gap-2 text-sm"><Briefcase className="w-4 h-4" /> Professionals</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {loading ? <p className="py-6 text-center text-sm text-slate-500">Loading professionals...</p> : filtered.length === 0 ? <p className="py-6 text-center text-sm text-slate-500">No professionals found.</p> : filtered.map((professional) => (
            <div key={professional.professionalId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border border-slate-200 rounded-lg">
              <div><p className="text-sm font-bold text-slate-900">{professional.businessName || professional.professionalName}</p><p className="text-xs text-slate-500">{professional.professionalName} • {professional.experienceYears} years experience</p>{professional.skills.length > 0 && <p className="text-[11px] text-slate-500 mt-1">{professional.skills.slice(0, 4).join(', ')}</p>}</div>
              <span className="text-xs px-2 py-1 rounded border border-slate-200">{professional.verificationStatus}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
