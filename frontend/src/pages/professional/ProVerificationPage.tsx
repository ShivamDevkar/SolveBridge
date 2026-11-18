import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';

export function ProVerificationPage() {
  const { user } = useAuth();
  const status = user?.verificationStatus || 'UNVERIFIED';
  const verified = status === 'VERIFIED';

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Verification</h1>
        <p className="text-xs text-slate-500 mt-1">Professional account verification status.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            {verified ? (
              <ShieldCheck className="w-7 h-7 text-emerald-600 shrink-0" />
            ) : (
              <ShieldAlert className="w-7 h-7 text-amber-600 shrink-0" />
            )}
            <div>
              <p className="text-sm font-bold text-slate-900">
                {verified ? 'Verified Professional' : status.replace(/_/g, ' ').toLowerCase()}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Verification information is managed by platform administrators.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
