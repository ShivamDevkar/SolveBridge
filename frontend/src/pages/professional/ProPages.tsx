import { PlaceholderPage } from '@/components/common/PlaceholderPage';

export function MatchingProblemsPage() {
  return (
    <PlaceholderPage
      title="Matching Customer Problems Feed"
      route="/pro/matching-problems"
      portal="Professional"
      phase="Phase 05 (Professional Portal)"
      description="Feed of active customer problem requests filtered by the professional's category, skills, and configured service radius. Highlights explainable match score percentages."
      backTo={{ label: 'Back to Dashboard', path: '/pro/dashboard' }}
      highlights={[
        'Address Privacy Safeguard: Exact street address is masked; only neighborhood and approximate km radius are shown.',
        'Filterable by distance, urgency level, category, and match score.',
        'Direct "Draft Proposal" action for each eligible matching request.',
      ]}
    />
  );
}

export function ProProblemInspectPage() {
  return (
    <PlaceholderPage
      title="Inspect Problem Request & Proposal Builder"
      route="/pro/matching-problems/:problemId"
      portal="Professional"
      phase="Phase 05 (Professional Portal & Proposal Builder)"
      description="In-depth problem inspection view with symptom descriptions, media attachments, timing preferences, and the structured proposal drafting drawer (estimated price, duration, proposed visit time, initial diagnosis, and inclusions/exclusions)."
      backTo={{ label: 'Back to Matching Problems', path: '/pro/matching-problems' }}
    />
  );
}

export function MyProposalsPage() {
  return (
    <PlaceholderPage
      title="Submitted Proposals Tracker"
      route="/pro/proposals"
      portal="Professional"
      phase="Phase 05 (Professional Portal)"
      description="Status tracker of all submitted proposals (Submitted, Viewed by Customer, Accepted, Not Selected, Expired) with edit and withdraw options before customer selection."
      backTo={{ label: 'Back to Dashboard', path: '/pro/dashboard' }}
    />
  );
}

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

export function ProProfileEditPage() {
  return (
    <PlaceholderPage
      title="Professional Profile & Coverage Settings"
      route="/pro/profile"
      portal="Professional"
      phase="Phase 05 (Professional Portal - Tier 1 Core MVP)"
      description="Management of business name, bio, service categories, specific skill tags, base pricing, and service radius slider (km)."
      backTo={{ label: 'Back to Dashboard', path: '/pro/dashboard' }}
    />
  );
}

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

export function ProSettingsPage() {
  return (
    <PlaceholderPage
      title="Operating Hours & Workbench Preferences"
      route="/pro/settings"
      portal="Professional"
      phase="Phase 05 (Professional Portal - Tier 3)"
      description="Working hours, automated lead notifications, and matching urgency filters."
      backTo={{ label: 'Back to Dashboard', path: '/pro/dashboard' }}
    />
  );
}
