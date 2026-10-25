import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PlusCircle, ArrowRight, MessageSquare, Briefcase, FileQuestion, Sparkles } from 'lucide-react';

export function CustomerDashboardPage() {
  const activeProblems = [
    {
      id: 'PB-00847',
      title: 'AC turns on but room is not cooling',
      category: 'HVAC Service',
      urgency: 'URGENT' as const,
      proposalsCount: 3,
      status: 'Comparing Proposals',
      time: 'Posted 2 hours ago',
    },
    {
      id: 'PB-00852',
      title: 'Washing machine front loader not draining water',
      category: 'Appliance Repair',
      urgency: 'SOON' as const,
      proposalsCount: 1,
      status: 'Matching',
      time: 'Posted yesterday',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/40 to-white border border-blue-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
            Customer Portal Hub
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            Welcome back, Sarthak
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
            You have <strong className="text-blue-700 font-semibold">2 active problem requests</strong> receiving proposals and <strong className="text-emerald-700 font-semibold">1 job in progress</strong>.
          </p>
        </div>
        <Link to="/customer/problems/new">
          <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Post a New Problem
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Active Problems</p>
              <p className="text-2xl font-bold text-slate-900 font-mono mt-0.5">2</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <FileQuestion className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Jobs in Progress</p>
              <p className="text-2xl font-bold text-emerald-700 font-mono mt-0.5">1</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Briefcase className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Active Conversations</p>
              <p className="text-2xl font-bold text-purple-700 font-mono mt-0.5">3</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <MessageSquare className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Problems Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Active Problem Requests</h2>
          <Link to="/customer/problems" className="text-xs text-blue-600 hover:underline font-semibold">
            View All Problems →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeProblems.map((p) => (
            <Card key={p.id} className="hover:border-blue-300 hover:shadow-card transition-all">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-blue-700 font-semibold">{p.id}</span>
                  <Badge variant="urgency" urgency={p.urgency} />
                </div>
                <CardTitle className="text-sm mt-1 text-slate-900 font-bold">{p.title}</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  {p.category} • {p.time}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2 pb-3">
                <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-700 flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <strong>{p.proposalsCount} Proposals</strong> received
                  </span>
                  <span className="text-[11px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Ready to Compare
                  </span>
                </div>
              </CardContent>
              <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                <Link to={`/customer/problems/${p.id}`} className="text-slate-600 hover:text-slate-900 font-medium">
                  Problem Details
                </Link>
                <Link to={`/customer/problems/${p.id}/compare`}>
                  <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3 h-3" />}>
                    Compare Proposals
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
