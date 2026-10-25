import { PlaceholderPage } from '@/components/common/PlaceholderPage';

export function JobWorkspaceOverviewPage() {
  return (
    <PlaceholderPage
      title="Job Workspace — Active Lifecycle & Audit Trail"
      route="/jobs/:jobId"
      portal="Job Workspace"
      phase="Phase 06 (Shared Job Workspace & Lifecycle)"
      description="The shared collaborative operational view for the assigned customer and professional. Features the controlled state machine tracker, timestamped audit log, and role-specific action triggers (e.g. Mark Arrived, Start Inspection, Submit Quote Revision, Mark Completed, Confirm Completion)."
      openDecisionNotice="Unresolved Decision #1: In the state machine, whether REVIEW is an internal status or an independent action linked to a closed job is an open decision. In all implementations, CUSTOMER_CONFIRMED is mandatory before CLOSED."
      highlights={[
        'Strict Privacy: Exact service address is revealed exclusively to the assigned customer, professional, and admin.',
        'Controlled Transitions: State transitions must follow the valid lifecycle sequence (e.g., SCHEDULED -> ON_THE_WAY -> ARRIVED -> INSPECTION -> IN_PROGRESS -> COMPLETED -> CUSTOMER_CONFIRMED -> CLOSED).',
      ]}
      actionButton={{ label: 'Open In-Stream Job Chat', linkTo: '/jobs/JOB-00847/chat' }}
    />
  );
}

export function JobWorkspaceChatPage() {
  return (
    <PlaceholderPage
      title="Real-Time Job Messaging & System Stream"
      route="/jobs/:jobId/chat"
      portal="Job Workspace"
      phase="Phase 06 (Shared Job Workspace & Real-Time Messaging)"
      description="Dedicated Socket.IO chat room (job:JOB_ID) combining private text/image messages with immutable system event cards (Technician Arrived card, Quote Revision card with inline Accept/Reject buttons, Completion Evidence card)."
      highlights={[
        'Private Socket.IO Channel: Restricted to customer, assigned professional, and admins.',
        'In-Stream Quote Cards: Customers can review and accept quote revisions directly inside the conversation stream.',
      ]}
    />
  );
}

export function QuoteRevisionPage() {
  return (
    <PlaceholderPage
      title="Transparent Quote Revision Management"
      route="/jobs/:jobId/quote-revision"
      portal="Job Workspace"
      phase="Phase 07 (Quote Revision & Scope Adjustments)"
      description="Structured quote revision interface. The professional submits new scope items, revised labor/parts, photographic justification, and the new total. The customer explicitly approves or rejects before work can proceed."
      highlights={[
        'Zero Unexpected Price Increases: All scope changes discovered during inspection require formal approval.',
        'Audit Trail: Revisions record original quote, revised amount, justification, and timestamped customer decision.',
      ]}
    />
  );
}

export function JobCompletionPage() {
  return (
    <PlaceholderPage
      title="Completion Evidence & Customer Confirmation"
      route="/jobs/:jobId/completion"
      portal="Job Workspace"
      phase="Phase 07 (Completion Verification)"
      description="Accountability sign-off gate. The professional marks the job complete and uploads before/after photos, parts used, and work notes. The customer inspects the evidence and explicitly confirms completion or raises an issue."
      highlights={[
        'Mandatory Customer Confirmation: A job cannot be closed unilaterally by the professional.',
        'Evidence Archiving: Photos and notes become part of the professional\'s permanent verified job record.',
      ]}
    />
  );
}

export function JobReviewPage() {
  return (
    <PlaceholderPage
      title="Verified Two-Sided Review & Rating"
      route="/jobs/:jobId/review"
      portal="Job Workspace"
      phase="Phase 07 (Completion & Reviews)"
      description="Multi-factor verified evaluation submitted only after successful job completion. Ratings across Quality, Professionalism, Punctuality, and Value contribute to the professional's public verified reputation."
      openDecisionNotice="The exact placement of Review in the job lifecycle status machine (Option A vs. Option B) is preserved as an open decision awaiting final alignment before Phase 02."
    />
  );
}

export function JobDisputePage() {
  return (
    <PlaceholderPage
      title="Dispute Resolution & Escalation Center"
      route="/jobs/:jobId/dispute"
      portal="Job Workspace"
      phase="Phase 08 (Dispute Management)"
      description="Formal conflict arbitration request. If service is incomplete or substandard, the customer can open a dispute. Evidence, message history, and quote revisions are locked and submitted to admin arbitrators."
      highlights={[
        'Arbitration Actions: Admin can order redo service, partial refund, full refund, or dismiss dispute.',
      ]}
    />
  );
}
