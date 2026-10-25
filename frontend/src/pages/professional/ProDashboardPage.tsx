import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Star,
  Clock,
  ArrowRight,
} from 'lucide-react';

export function ProDashboardPage() {
  const matchingProblems = [
    {
      id: 'PB-00847',
      title: 'AC turns on but room is not cooling',
      category: 'HVAC Service',
      urgency: 'URGENT' as const,
      matchScore: 94,
      approxDistance: '2.1 km away (Kothrud)',
      posted: '15 mins ago',
    },
    {
      id: 'PB-00854',
      title: 'Split AC water leaking inside bedroom wall',
      category: 'HVAC Service',
      urgency: 'SOON' as const,
      matchScore: 89,
      approxDistance: '3.8 km away (Aundh)',
      posted: '1 hour ago',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Workbench Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50/40 to-white border border-amber-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              Professional Workbench
            </span>
            <Badge variant="verified" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Arun HVAC Services
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
            You have <strong className="text-purple-700 font-semibold">5 matching job requests</strong> in your 15km service radius, and <strong className="text-emerald-700 font-semibold">1 active job in progress</strong>.
          </p>
        </div>
        <Link to="/pro/matching-problems">
          <Button variant="primary" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-sm border border-amber-500/30" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Inspect Matching Jobs
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Matching Leads</p>
            <p className="text-2xl font-bold text-purple-700 font-mono mt-1">5</p>
            <span className="text-[10px] text-slate-500">Based on skills & radius</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Active Proposals</p>
            <p className="text-2xl font-bold text-blue-700 font-mono mt-1">3</p>
            <span className="text-[10px] text-slate-500">Awaiting customer selection</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Month Earnings</p>
            <p className="text-2xl font-bold text-emerald-700 font-mono mt-1">₹34,500</p>
            <span className="text-[10px] text-slate-500">18 completed jobs</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Verified Rating</p>
            <p className="text-2xl font-bold text-amber-700 font-mono mt-1 flex items-center gap-1">
              4.8 <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </p>
            <span className="text-[10px] text-slate-500">142 verified reviews</span>
          </CardContent>
        </Card>
      </div>

      {/* Matching Jobs Teaser */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Live Matching Requests</h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
              ⚡ Explainable Algorithm
            </span>
          </div>
          <Link to="/pro/matching-problems" className="text-xs text-amber-700 hover:underline font-semibold">
            View All Matching Jobs →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matchingProblems.map((p) => (
            <Card key={p.id} className="hover:border-amber-300 hover:shadow-card transition-all">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-amber-700 font-semibold">{p.id}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="match" matchScore={p.matchScore} />
                    <Badge variant="urgency" urgency={p.urgency} />
                  </div>
                </div>
                <CardTitle className="text-sm mt-1 text-slate-900 font-bold">{p.title}</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  {p.category} • {p.posted}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-1 pb-3 text-xs text-slate-600 space-y-1">
                <p className="flex items-center gap-1.5 text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Approximate Location: <strong className="text-slate-900">{p.approxDistance}</strong>
                </p>
                <p className="text-[11px] text-slate-500 italic">
                  * Customer street address is masked during matching and revealed upon proposal selection.
                </p>
              </CardContent>
              <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                <Link to={`/pro/matching-problems/${p.id}`} className="text-slate-600 hover:text-slate-900 font-medium">
                  Inspect Problem
                </Link>
                <Link to={`/pro/matching-problems/${p.id}`}>
                  <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3 h-3" />}>
                    Draft Proposal
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
