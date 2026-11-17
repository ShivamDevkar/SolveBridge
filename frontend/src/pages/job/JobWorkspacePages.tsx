import { PlaceholderPage } from '@/components/common/PlaceholderPage';

export { JobWorkspaceOverviewPage } from './JobWorkspaceOverviewPage';
export { JobWorkspaceChatPage } from './JobWorkspaceChatPage';
export { JobWorkspaceScopeAdjustmentPage as QuoteRevisionPage } from './JobWorkspaceScopeAdjustmentPage';
export { JobCompletionPage } from './JobCompletionPage';
export { JobDisputePage } from './JobDisputePage';

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
