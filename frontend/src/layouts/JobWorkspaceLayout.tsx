import { useState } from 'react';
import { Outlet, Link, useParams, useLocation } from 'react-router-dom';
import {
  Wrench,
  CheckCircle2,
  Clock,
  MessageSquare,
  FileEdit,
  ClipboardCheck,
  Star,
  ShieldAlert,
  ArrowLeft,
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function JobWorkspaceLayout() {
  const { jobId = 'JOB-00847' } = useParams();
  const location = useLocation();
  const [stepperExpanded, setStepperExpanded] = useState(false);

  // Stepper milestones illustrating the Job Lifecycle
  const steps = [
    { id: 'SCHEDULED', label: 'Scheduled', status: 'completed' },
    { id: 'ON_THE_WAY', label: 'On The Way', status: 'completed' },
    { id: 'ARRIVED', label: 'Arrived', status: 'completed' },
    { id: 'INSPECTION', label: 'Inspection', status: 'completed' },
    { id: 'IN_PROGRESS', label: 'In Progress', status: 'current' },
    { id: 'COMPLETED', label: 'Completed', status: 'upcoming' },
    { id: 'CUSTOMER_CONFIRMED', label: 'Customer Confirmed', status: 'upcoming' },
    { id: 'CLOSED', label: 'Closed', status: 'upcoming' },
  ];

  const jobTabs = [
    { label: 'Overview & Stepper', path: `/jobs/${jobId}`, icon: <Wrench className="w-4 h-4" /> },
    { label: 'Live Chat & Events', path: `/jobs/${jobId}/chat`, icon: <MessageSquare className="w-4 h-4" />, badge: 'Live' },
    { label: 'Quote Revisions', path: `/jobs/${jobId}/quote-revision`, icon: <FileEdit className="w-4 h-4" /> },
    { label: 'Completion Evidence', path: `/jobs/${jobId}/completion`, icon: <ClipboardCheck className="w-4 h-4" /> },
    { label: 'Verified Review', path: `/jobs/${jobId}/review`, icon: <Star className="w-4 h-4" /> },
    { label: 'Dispute / Support', path: `/jobs/${jobId}/dispute`, icon: <ShieldAlert className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3.5 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Back button and Job Identity */}
          <div className="flex items-center gap-3">
            <Link to="/customer/jobs">
              <Button variant="ghost" size="sm" className="p-2" aria-label="Back to Jobs Directory">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  #{jobId}
                </span>
                <Badge variant="status">
                  <span className="font-semibold">IN PROGRESS</span>
                </Badge>
                <span className="text-xs text-slate-500 hidden md:inline">
                  Category: <strong className="text-slate-800">HVAC Service</strong>
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight mt-0.5">
                AC turns on but room is not cooling
              </h1>
            </div>
          </div>

          {/* Engagement Financials and Participants */}
          <div className="flex items-center gap-4 text-xs">
            <div className="text-right">
              <p className="text-slate-500">Agreed Solution Price</p>
              <p className="text-base font-bold text-emerald-700 font-mono">₹900</p>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden sm:block" />
            <div className="text-left hidden sm:block">
              <p className="text-slate-500">Assigned Professional</p>
              <div className="flex items-center gap-1 font-semibold text-slate-800">
                <span>Arun HVAC</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Strict Address Privacy & Security Indicator */}
        <div className="max-w-7xl mx-auto mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              Restricted Service Address disclosed to assigned parties:{' '}
              <strong className="text-slate-900 font-mono">Flat 402, Shivajinagar, Pune 411005</strong>
            </span>
          </div>
          <span className="text-[10px] text-slate-500 hidden md:inline">
            Workflow Protected Channel (Socket Room: job:{jobId})
          </span>
        </div>
      </header>

      {/* Interactive Lifecycle Stepper (Horizontal on Desktop, Collapsible on Mobile) */}
      <section aria-label="Job Lifecycle Progress" className="bg-slate-100/70 border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between md:hidden">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              Current State: <strong className="text-blue-600">IN PROGRESS</strong>
            </span>
            <button
              onClick={() => setStepperExpanded(!stepperExpanded)}
              className="text-xs text-blue-600 font-semibold flex items-center gap-1 py-1 px-2 rounded hover:bg-slate-200"
            >
              <span>{stepperExpanded ? 'Hide Timeline' : 'View Timeline'}</span>
              {stepperExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className={`${stepperExpanded ? 'block mt-3' : 'hidden'} md:block`}>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
              {steps.map((step) => {
                const isCompleted = step.status === 'completed';
                const isCurrent = step.status === 'current';
                return (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center p-2 rounded-lg text-center transition-all ${
                      isCurrent
                        ? 'bg-white border-2 border-blue-600 shadow-sm'
                        : isCompleted
                        ? 'bg-white/80 border border-slate-200'
                        : 'bg-slate-50/60 border border-slate-200/60 text-slate-400'
                    }`}
                  >
                    <div className="mb-1">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : isCurrent ? (
                        <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center animate-pulse">
                          <span className="w-1.5 h-1.5 bg-white rounded-full" />
                        </div>
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-medium leading-tight ${
                        isCurrent
                          ? 'text-blue-700 font-bold'
                          : isCompleted
                          ? 'text-slate-800 font-semibold'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Contextual Job Navigation Tabs */}
      <nav
        aria-label="Job Workspace Tabs"
        className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 overflow-x-auto"
      >
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          {jobTabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex items-center gap-2 px-3.5 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {tab.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Workspace Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
