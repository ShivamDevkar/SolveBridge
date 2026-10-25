import { PlaceholderPage } from '@/components/common/PlaceholderPage';

export function CreateProblemPage() {
  return (
    <PlaceholderPage
      title="Create New Problem Request (5-Step Wizard)"
      route="/customer/problems/new"
      portal="Customer"
      phase="Phase 03 (Customer Portal & Wizard)"
      description="5-step symptom-first guided wizard for posting issues without requiring technical jargon: 1. Describe Symptoms, 2. Upload Photos/Evidence, 3. Specify Location (Address masked for matching), 4. Set Urgency & Preferred Window, 5. Review & Publish."
      backTo={{ label: 'Back to Dashboard', path: '/customer/dashboard' }}
      highlights={[
        'Symptom Description: Plain language text input without forcing taxonomy selection.',
        'Address Privacy: Customer street address is masked during matching and discovery; only city/area is shared.',
        'Urgency Selection: Normal, Soon, Urgent.',
      ]}
    />
  );
}

export function CustomerProblemsListPage() {
  return (
    <PlaceholderPage
      title="My Posted Problems Directory"
      route="/customer/problems"
      portal="Customer"
      phase="Phase 03 (Customer Portal)"
      description="Filterable list of all problems posted by the customer, categorized into Open, Comparing Proposals, Professional Selected, and Closed."
      backTo={{ label: 'Back to Dashboard', path: '/customer/dashboard' }}
    />
  );
}

export function CustomerProblemDetailPage() {
  return (
    <PlaceholderPage
      title="Problem Request Overview & Media Gallery"
      route="/customer/problems/:problemId"
      portal="Customer"
      phase="Phase 03 (Customer Portal)"
      description="Comprehensive detail page of an individual problem request, displaying submitted symptoms, high-resolution media gallery, current matching engine status, and incoming proposal counter."
      backTo={{ label: 'Back to My Problems', path: '/customer/problems' }}
    />
  );
}

export function ProposalComparisonPage() {
  return (
    <PlaceholderPage
      title="Side-by-Side Proposal Comparison Matrix"
      route="/customer/problems/:problemId/compare"
      portal="Customer"
      phase="Phase 04 (Matching Engine & Comparison)"
      description="Side-by-side comparative table allowing the customer to compare up to 4 structured proposals across Price (₹), Estimated Duration, Arrival Time, Diagnostic Approach, Inclusions/Exclusions, and Verified Reputation."
      backTo={{ label: 'Back to Problem Details', path: '/customer/problems' }}
      highlights={[
        'Multi-factor comparison preventing low-ball race conditions.',
        'Direct "Select Professional" transaction action converting proposal into active Job.',
        'Explainable Match Score breakdown (Skill, Distance, Availability, Rating).',
      ]}
    />
  );
}

export function CustomerJobsListPage() {
  return (
    <PlaceholderPage
      title="Accepted Jobs Directory"
      route="/customer/jobs"
      portal="Customer"
      phase="Phase 06 (Shared Job Workspace)"
      description="List of all accepted active jobs and completed job history. Clicking any active job navigates into the dedicated Shared Job Workspace."
      backTo={{ label: 'Back to Dashboard', path: '/customer/dashboard' }}
      actionButton={{ label: 'Open Sample Job #JOB-00847', linkTo: '/jobs/JOB-00847' }}
    />
  );
}

export function CustomerMessagesPage() {
  return (
    <PlaceholderPage
      title="Customer Messages Inbox"
      route="/customer/messages"
      portal="Customer"
      phase="Phase 06 (Shared Job Workspace & Messaging)"
      description="Centralized conversation index listing active communication threads across assigned jobs. Selecting a conversation thread routes into the real-time chat within the respective Job Workspace."
      backTo={{ label: 'Back to Dashboard', path: '/customer/dashboard' }}
      actionButton={{ label: 'Open Chat for Job #JOB-00847', linkTo: '/jobs/JOB-00847/chat' }}
    />
  );
}

export function CustomerReviewsPage() {
  return (
    <PlaceholderPage
      title="My Reviews & Service Feedback"
      route="/customer/reviews"
      portal="Customer"
      phase="Phase 07 (Completion & Reviews)"
      description="Directory of verified reviews submitted by the customer across past completed jobs, with individual ratings for quality, professionalism, punctuality, and value."
      backTo={{ label: 'Back to Dashboard', path: '/customer/dashboard' }}
      openDecisionNotice="Customer Reviews priority is currently documented as an open decision (Tier 2 in roadmap vs. Tier 1 core MVP). It is included here in the routing structure to guarantee complete route parity with SOLVEBID.txt Section 77 without inventing a final prioritization."
    />
  );
}

export function CustomerNotificationsPage() {
  return (
    <PlaceholderPage
      title="Notifications & System Alerts"
      route="/customer/notifications"
      portal="Customer"
      phase="Phase 02 / 03 (Customer Notifications - Tier 2)"
      description="Real-time and historic notification feed alerting the customer to incoming proposals, professional arrival updates, quote revisions, and completion sign-off requests."
      backTo={{ label: 'Back to Dashboard', path: '/customer/dashboard' }}
    />
  );
}

export function CustomerProfilePage() {
  return (
    <PlaceholderPage
      title="Customer Profile & Address Book"
      route="/customer/profile"
      portal="Customer"
      phase="Phase 02 / 03 (Customer Profile - Tier 2)"
      description="Personal contact details, verified phone number, and default service address management."
      backTo={{ label: 'Back to Dashboard', path: '/customer/dashboard' }}
    />
  );
}

export function CustomerSettingsPage() {
  return (
    <PlaceholderPage
      title="Customer Account & Privacy Settings"
      route="/customer/settings"
      portal="Customer"
      phase="Phase 03 (Customer Settings - Tier 3)"
      description="Notification preferences, security settings, session management, and privacy configuration."
      backTo={{ label: 'Back to Dashboard', path: '/customer/dashboard' }}
    />
  );
}
