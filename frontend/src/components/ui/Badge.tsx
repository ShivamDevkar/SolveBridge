import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, Clock, Calendar, Sparkles, Disc, ShieldAlert } from 'lucide-react';
import { UrgencyLevel, VerificationStatus } from '@/types/common';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'verified' | 'urgency' | 'match' | 'neutral' | 'status' | 'dispute';
  urgency?: UrgencyLevel;
  verification?: VerificationStatus;
  matchScore?: number;
  icon?: React.ReactNode;
}

export function Badge({
  className,
  variant = 'neutral',
  urgency,
  verification,
  matchScore,
  icon,
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border select-none';

  // Specific semantic renderers
  if (variant === 'verified' || verification === 'VERIFIED') {
    return (
      <span
        className={cn(
          baseStyles,
          'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium',
          className
        )}
        {...props}
      >
        {icon || <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />}
        <span>{children || 'Verified Professional'}</span>
      </span>
    );
  }

  if (variant === 'urgency' && urgency) {
    const urgencyConfig = {
      URGENT: {
        bg: 'bg-red-50 text-red-700 border-red-200',
        icon: <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" aria-hidden="true" />,
        label: 'Urgent',
      },
      SOON: {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        icon: <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />,
        label: 'Soon',
      },
      NORMAL: {
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        icon: <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true" />,
        label: 'Normal',
      },
    };
    const current = urgencyConfig[urgency];
    return (
      <span className={cn(baseStyles, current.bg, className)} {...props}>
        {icon || current.icon}
        <span>{children || current.label}</span>
      </span>
    );
  }

  if (variant === 'match' && typeof matchScore === 'number') {
    return (
      <span
        className={cn(
          baseStyles,
          'bg-purple-50 text-purple-700 border-purple-200 font-semibold',
          className
        )}
        {...props}
      >
        {icon || <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" aria-hidden="true" />}
        <span>{children || `${matchScore}% Match`}</span>
      </span>
    );
  }

  if (variant === 'dispute') {
    return (
      <span
        className={cn(
          baseStyles,
          'bg-red-50 text-red-700 border-red-200',
          className
        )}
        {...props}
      >
        {icon || <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" aria-hidden="true" />}
        <span>{children || 'Disputed'}</span>
      </span>
    );
  }

  if (variant === 'status') {
    return (
      <span
        className={cn(
          baseStyles,
          'bg-blue-50 text-blue-700 border-blue-200',
          className
        )}
        {...props}
      >
        {icon || <Disc className="w-3 h-3 text-blue-600 shrink-0" aria-hidden="true" />}
        <span>{children}</span>
      </span>
    );
  }

  // Default fallback neutral badge
  return (
    <span
      className={cn(
        baseStyles,
        'bg-slate-100 text-slate-700 border-slate-200',
        className
      )}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </span>
  );
}
