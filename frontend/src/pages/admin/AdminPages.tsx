import { PlaceholderPage } from '@/components/common/PlaceholderPage';

// Real Phase 08 Admin Console Implementations
export { AdminDashboardPage } from './AdminDashboardPage';
export { AdminVerificationQueuePage } from './AdminVerificationQueuePage';
export { AdminVerificationDetailPage } from './AdminVerificationDetailPage';
export { AdminDisputesListPage } from './AdminDisputesListPage';
export { AdminDisputeDetailPage } from './AdminDisputeDetailPage';
export { AdminCategoriesPage } from './AdminCategoriesPage';
export { AdminAuditLogsPage } from './AdminAuditLogsPage';

// Retained Tier 2 / Future Expansion Admin Pages
export function AdminProfessionalsListPage() {
  return (
    <PlaceholderPage
      title="All Professionals Directory"
      route="/admin/professionals"
      portal="Admin"
      phase="Phase 08 (Admin Governance & Operations)"
      description="Administrative directory of all registered service professionals across all verification states (Registered, Pending Verification, Verified, Suspended, Rejected)."
      backTo={{ label: 'Back to Admin Dashboard', path: '/admin/dashboard' }}
    />
  );
}

export function AdminProblemsListPage() {
  return (
    <PlaceholderPage
      title="Customer Problems Moderation & Oversight"
      route="/admin/problems"
      portal="Admin"
      phase="Phase 08 (Admin Console - Tier 1 Core MVP)"
      description="Directory of all customer-submitted problem requests across all statuses, enabling moderation of suspicious descriptions, offensive images, or policy violations."
      backTo={{ label: 'Back to Admin Dashboard', path: '/admin/dashboard' }}
    />
  );
}

export function AdminJobsListPage() {
  return (
    <PlaceholderPage
      title="Global Job State Machine Monitor"
      route="/admin/jobs"
      portal="Admin"
      phase="Phase 08 (Admin Console - Tier 1 Core MVP)"
      description="Real-time monitor of all active and historical jobs across the platform, filterable by state machine status (SCHEDULED, ARRIVED, INSPECTION, IN_PROGRESS, COMPLETED, CUSTOMER_CONFIRMED, DISPUTED, CLOSED)."
      backTo={{ label: 'Back to Admin Dashboard', path: '/admin/dashboard' }}
    />
  );
}

export function AdminUsersListPage() {
  return (
    <PlaceholderPage
      title="Platform User Directory & Account Moderation"
      route="/admin/users"
      portal="Admin"
      phase="Phase 08 (Admin Console - Tier 2)"
      description="Searchable directory of all registered customers and service professionals with status management (Active, Suspended, Flagged)."
      backTo={{ label: 'Back to Admin Dashboard', path: '/admin/dashboard' }}
    />
  );
}

export function AdminReportsPage() {
  return (
    <PlaceholderPage
      title="Content & Misconduct Flagging Queue"
      route="/admin/reports"
      portal="Admin"
      phase="Phase 08 (Admin Console - Tier 2)"
      description="Triage queue for user-reported inappropriate messages, spam proposals, or unsafe behavior."
      backTo={{ label: 'Back to Admin Dashboard', path: '/admin/dashboard' }}
    />
  );
}

export function AdminAnalyticsPage() {
  return (
    <PlaceholderPage
      title="Marketplace Performance & Conversion Analytics"
      route="/admin/analytics"
      portal="Admin"
      phase="Phase 08 (Admin Console - Tier 2)"
      description="Interactive charts tracking proposal acceptance rates, average response times, category demand heatmaps, and dispute percentages."
      backTo={{ label: 'Back to Admin Dashboard', path: '/admin/dashboard' }}
    />
  );
}

export function AdminSettingsPage() {
  return (
    <PlaceholderPage
      title="Matching Algorithm Weights & Global Configuration"
      route="/admin/settings"
      portal="Admin"
      phase="Phase 08 (Admin Console - Tier 2 / 3)"
      description="Configuration of rule-based matching engine factor weights (Skill %, Distance %, Availability %, Rating %, Response Speed %) and marketplace parameters."
      backTo={{ label: 'Back to Admin Dashboard', path: '/admin/dashboard' }}
    />
  );
}
