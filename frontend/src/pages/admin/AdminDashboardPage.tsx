import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, ScrollText } from 'lucide-react';

export function AdminDashboardPage() {
  const pendingVerifications = [
    { id: 'PRO-1024', name: 'Pune Rapid Plumbing', category: 'Plumbing', docs: 'Trade License, ID Proof', date: 'Submitted Today' },
    { id: 'PRO-1025', name: 'Apex Electrical Solutions', category: 'Electrical', docs: 'Govt Wireman Cert, GST', date: 'Submitted Today' },
    { id: 'PRO-1026', name: 'CoolBreeze Air Conditioning', category: 'HVAC', docs: 'Appliance Cert, Business PAN', date: 'Submitted Yesterday' },
  ];

  const openDisputes = [
    { id: 'DISP-084', jobId: 'JOB-00812', reason: 'Repair incomplete / cooling failed after 24 hours', customer: 'Rohan Sharma', pro: 'QuickFix AC', severity: 'High' },
  ];

  return (
    <div className="space-y-6">
      {/* Admin Title Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50/40 to-white border border-purple-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
            Governance & Analytics Console
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            Marketplace Health & Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
            Real-time platform oversight: professional verification queues, dispute arbitration, and audit logs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/verification">
            <Button variant="primary" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-sm border border-purple-500/30">
              Audit Pending Pros
            </Button>
          </Link>
          <Link to="/admin/audit-logs">
            <Button variant="secondary" size="sm" leftIcon={<ScrollText className="w-3.5 h-3.5" />}>
              Audit Logs
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Total Customers</p>
            <p className="text-2xl font-bold text-blue-700 font-mono mt-1">1,248</p>
            <span className="text-[10px] text-slate-500">+14% this month</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Verified Pros</p>
            <p className="text-2xl font-bold text-emerald-700 font-mono mt-1">320</p>
            <span className="text-[10px] text-slate-500">Across 4 major domains</span>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/30">
          <CardContent className="p-4">
            <p className="text-xs text-amber-800 font-medium">Pending Verifications</p>
            <p className="text-2xl font-bold text-amber-700 font-mono mt-1">3</p>
            <span className="text-[10px] text-amber-800/80 font-medium">Awaiting document audit</span>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/30">
          <CardContent className="p-4">
            <p className="text-xs text-red-800 font-medium">Open Disputes</p>
            <p className="text-2xl font-bold text-red-700 font-mono mt-1">1</p>
            <span className="text-[10px] text-red-800/80 font-medium">Requires arbitration decision</span>
          </CardContent>
        </Card>
      </div>

      {/* Operational Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Queue Preview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
            <div>
              <CardTitle className="text-sm text-slate-900 font-bold">Pending Professional Verifications</CardTitle>
              <CardDescription className="text-xs text-slate-500">Credential and background audit requests</CardDescription>
            </div>
            <Link to="/admin/verification" className="text-xs text-purple-700 hover:underline font-semibold">
              View All ({pendingVerifications.length}) →
            </Link>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-2">
            {pendingVerifications.map((pro) => (
              <div
                key={pro.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{pro.name}</span>
                    <span className="font-mono text-[10px] text-slate-500">{pro.id}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {pro.category} • Documents: {pro.docs}
                  </p>
                </div>
                <Link to={`/admin/verification/${pro.id}`}>
                  <Button variant="outline" size="sm" className="text-xs py-1 px-2.5">
                    Review Docs
                  </Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Dispute Arbitration Queue */}
        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
            <div>
              <CardTitle className="text-sm flex items-center gap-1.5 text-slate-900 font-bold">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Active Dispute Cases
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">Escalated conflicts awaiting administrator decision</CardDescription>
            </div>
            <Link to="/admin/disputes" className="text-xs text-red-700 hover:underline font-semibold">
              View All ({openDisputes.length}) →
            </Link>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-2">
            {openDisputes.map((d) => (
              <div
                key={d.id}
                className="p-3 bg-red-50/50 border border-red-200/80 rounded-lg flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-red-700">{d.id}</span>
                    <span className="font-mono text-[10px] text-slate-500">Job: #{d.jobId}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                      {d.severity} Priority
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 font-medium">{d.reason}</p>
                  <p className="text-[11px] text-slate-500">
                    Customer: {d.customer} • Pro: {d.pro}
                  </p>
                </div>
                <Link to={`/admin/disputes/${d.id}`}>
                  <Button variant="danger" size="sm" className="text-xs py-1 px-2.5">
                    Arbitrate Case
                  </Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
