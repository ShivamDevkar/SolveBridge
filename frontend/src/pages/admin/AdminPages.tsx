import { PlaceholderPage } from '@/components/common/PlaceholderPage';

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

export function AdminVerificationQueuePage() {
  return (
    <PlaceholderPage
      title="Professional Verification Audit Queue"
      route="/admin/verification"
      portal="Admin"
      phase="Phase 08 (Admin Console - Tier 1 Core MVP)"
      description="Queue of service specialists awaiting credential validation. Admins inspect uploaded ID proofs, business certificates, trade licenses, and background checks."
      backTo={{ label: 'Back to Admin Dashboard', path: '/admin/dashboard' }}
      highlights={[
        'Actions: Approve Credential, Reject Submission, or Request Further Documentation.',
        'Approval triggers automatic "Verified Professional" badge assignment on user profile.',
      ]}
    />
  );
}

export function AdminVerificationDetailPage() {
  return (
    <PlaceholderPage
      title="Professional Document Inspection & Decision"
      route="/admin/verification/:proId"
      portal="Admin"
      phase="Phase 08 (Admin Console - Tier 1 Core MVP)"
      description="Deep document audit view with high-resolution document viewer and audit trail logging for administrative decisions."
      backTo={{ label: 'Back to Verification Queue', path: '/admin/verification' }}
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

export function AdminDisputesListPage() {
  return (
    <PlaceholderPage
      title="Dispute Arbitration & Resolution Center"
      route="/admin/disputes"
      portal="Admin"
      phase="Phase 08 (Admin Console - Tier 1 Core MVP)"
      description="Arbitration queue of open conflicts between customers and professionals. Admins inspect chat logs, quote revision histories, and completion photos."
      backTo={{ label: 'Back to Admin Dashboard', path: '/admin/dashboard' }}
      highlights={[
        'Decisions: Redo Service, Partial Refund, Full Refund, Dismiss Dispute, or Close Without Compensation.',
      ]}
    />
  );
}

export function AdminDisputeDetailPage() {
  return (
    <PlaceholderPage
      title="Dispute Investigation & Case Arbitration"
      route="/admin/disputes/:disputeId"
      portal="Admin"
      phase="Phase 08 (Admin Console - Tier 1 Core MVP)"
      description="Evidence inspection workspace containing full chat transcripts, quote revision logs, before/after photos, and arbitration decision form."
      backTo={{ label: 'Back to Disputes Center', path: '/admin/disputes' }}
    />
  );
}

export function AdminCategoriesPage() {
  return (
    <PlaceholderPage
      title="Service Categories & Skill Taxonomy Manager"
      route="/admin/categories"
      portal="Admin"
      phase="Phase 08 (Admin Console - Tier 1 Core MVP)"
      description="Taxonomy manager for creating new service domains, subcategories, problem symptom tags, and required skill certifications."
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

export function AdminAuditLogsPage() {
  return (
    <PlaceholderPage
      title="Immutable System Audit Trail"
      route="/admin/audit-logs"
      portal="Admin"
      phase="Phase 08 (Admin Console - Tier 2)"
      description="Searchable, filterable audit log recording every critical state transition, quote approval, verification action, and administrative decision with actor ID and timestamp."
      backTo={{ label: 'Back to Admin Dashboard', path: '/admin/dashboard' }}
      highlights={[
        'Compliance: Immutable record of who approved what and when.',
        'Filterable by Actor, Entity Type (Problem, Proposal, Job, Dispute), and Action.',
      ]}
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
