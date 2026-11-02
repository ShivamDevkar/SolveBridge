import { PlaceholderPage } from '@/components/common/PlaceholderPage';

export { MatchingProblemsPage } from './MatchingProblemsPage';
export { ProProblemInspectPage } from './ProProblemInspectPage';
export { MyProposalsPage } from './MyProposalsPage';

export function ProJobsListPage() {
  return (
    <PlaceholderPage
      title="Professional Active Jobs & Assignments"
      route="/pro/jobs"
      portal="Professional"
      phase="Phase 06 (Shared Job Workspace)"
      description="Directory of accepted jobs where the professional has been selected. Clicking an active job opens the dedicated Shared Job Workspace with exact address access."
      backTo={{ label: 'Back to Dashboard', path: '/pro/dashboard' }}
      actionButton={{ label: 'Open Sample Job #JOB-00847', linkTo: '/jobs/JOB-00847' }}
    />
  );
}

export function ProMessagesPage() {
  return (
    <PlaceholderPage
      title="Professional Messages Inbox"
      route="/pro/messages"
      portal="Professional"
      phase="Phase 06 (Shared Job Workspace & Messaging)"
      description="Centralized index of all active customer chat conversations across assigned jobs. Selecting any thread routes into the real-time chat within the respective Job Workspace."
      backTo={{ label: 'Back to Dashboard', path: '/pro/dashboard' }}
      actionButton={{ label: 'Open Chat for Job #JOB-00847', linkTo: '/jobs/JOB-00847/chat' }}
    />
  );
}

export function ProReviewsPage() {
  return (
    <PlaceholderPage
      title="Verified Reviews & Reputation Portfolio"
      route="/pro/reviews"
      portal="Professional"
      phase="Phase 05 / 07 (Professional Reviews - Tier 1 Core MVP per § 101)"
      description="Showcase of customer reviews earned from completed, confirmed jobs, displaying aggregate ratings across Quality, Professionalism, Punctuality, and Value, along with pro response tools."
      backTo={{ label: 'Back to Dashboard', path: '/pro/dashboard' }}
      highlights={[
        'Verified Reviews: Strictly restricted to completed, customer-confirmed jobs.',
        'Two-sided Reputation: Professional response mechanism to client reviews.',
      ]}
    />
  );
}

export function ProSchedulePage() {
  return (
    <PlaceholderPage
      title="Appointment Schedule & Daily Agenda"
      route="/pro/schedule"
      portal="Professional"
      phase="Phase 05 (Professional Portal - Tier 2)"
      description="Calendar and daily agenda view showing scheduled service visits, on-site inspections, and availability time blocks."
      backTo={{ label: 'Back to Dashboard', path: '/pro/dashboard' }}
    />
  );
}

export function ProEarningsPage() {
  return (
    <PlaceholderPage
      title="Earnings, Invoices & Payout Records"
      route="/pro/earnings"
      portal="Professional"
      phase="Phase 05 (Professional Portal - Tier 2)"
      description="Financial ledger of completed jobs, original quotes vs. approved quote revisions, and simulated payout status."
      backTo={{ label: 'Back to Dashboard', path: '/pro/dashboard' }}
    />
  );
}

export { ProProfilePage as ProProfileEditPage, ProProfilePage } from './ProProfilePage';

export function ProVerificationPage() {
  return (
    <PlaceholderPage
      title="Professional Verification & Credential Audit"
      route="/pro/verification"
      portal="Professional"
      phase="Phase 05 (Professional Portal - Tier 1 Core MVP)"
      description="Document submission workflow for ID verification, trade licenses, certifications, and background audit status tracking."
      backTo={{ label: 'Back to Dashboard', path: '/pro/dashboard' }}
      highlights={[
        'Verification Badging: The "Verified Professional" badge is granted only after administrative approval.',
        'Status Lifecycle: Registered -> Pending Verification -> Verified (or Suspended/Rejected).',
      ]}
    />
  );
}

export { ProSettingsPage } from './ProSettingsPage';
