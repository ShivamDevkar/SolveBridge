import { PlaceholderPage } from '@/components/common/PlaceholderPage';

export { CreateProblemWizardPage as CreateProblemPage, CreateProblemWizardPage } from './CreateProblemWizardPage';
export { CustomerProblemsListPage } from './CustomerProblemsListPage';
export { CustomerProblemDetailPage } from './CustomerProblemDetailPage';
export { ProposalComparisonPage } from './ProposalComparisonPage';

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

export { CustomerProfilePage } from './CustomerProfilePage';
export { CustomerSettingsPage } from './CustomerSettingsPage';
