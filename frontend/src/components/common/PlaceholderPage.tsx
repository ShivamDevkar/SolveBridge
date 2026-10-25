import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Clock, Info, ShieldCheck, ArrowLeft } from 'lucide-react';

export interface PlaceholderPageProps {
  title: string;
  route: string;
  portal: 'Public' | 'Authentication' | 'Customer' | 'Professional' | 'Job Workspace' | 'Admin';
  phase: string;
  description: string;
  backTo?: { label: string; path: string };
  highlights?: string[];
  openDecisionNotice?: string;
  actionButton?: { label: string; onClick?: () => void; linkTo?: string };
}

export function PlaceholderPage({
  title,
  route,
  portal,
  phase,
  description,
  backTo,
  highlights,
  openDecisionNotice,
  actionButton,
}: PlaceholderPageProps) {
  const portalColors = {
    Public: 'bg-blue-50 text-blue-700 border-blue-200',
    Authentication: 'bg-amber-50 text-amber-800 border-amber-200',
    Customer: 'bg-blue-50 text-blue-700 border-blue-200',
    Professional: 'bg-amber-50 text-amber-800 border-amber-200',
    'Job Workspace': 'bg-emerald-50 text-emerald-800 border-emerald-200',
    Admin: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {backTo && (
        <Link
          to={backTo.path}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 rounded p-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{backTo.label}</span>
        </Link>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <span
              className={`px-2.5 py-0.5 rounded text-[11px] font-semibold border ${portalColors[portal]}`}
            >
              {portal} Portal
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Planned Deliverable: <strong className="text-slate-700">{phase}</strong>
            </span>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">{title}</CardTitle>
          <CardDescription className="text-sm font-mono text-slate-500 mt-0.5">
            Route: {route}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">{description}</p>

          {/* Open Product Decision Callout if applicable */}
          {openDecisionNotice && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-800">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">Open Product Decision Notice</p>
                <p className="text-amber-800 leading-relaxed mt-0.5">{openDecisionNotice}</p>
              </div>
            </div>
          )}

          {highlights && highlights.length > 0 && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Specification from SOLVEBID.txt
              </h4>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                {highlights.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {actionButton && (
            <div className="pt-2">
              {actionButton.linkTo ? (
                <Link to={actionButton.linkTo}>
                  <Button variant="primary" size="sm">
                    {actionButton.label}
                  </Button>
                </Link>
              ) : (
                <Button variant="primary" size="sm" onClick={actionButton.onClick}>
                  {actionButton.label}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
