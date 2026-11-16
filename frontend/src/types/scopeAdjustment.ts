export type ScopeAdjustmentStatus =
  | 'PENDING'    // Awaiting response from counterparty
  | 'ACCEPTED'   // Accepted by counterparty, applied to job currentAmount
  | 'DECLINED'   // Declined by counterparty
  | 'CANCELLED'; // Withdrawn by initiator

export type ScopeAdjustmentParty = 'CUSTOMER' | 'PROFESSIONAL';

export interface ScopeAdjustment {
  id: string;
  jobId: string;
  adjustmentNumber: number; // Sequential adjustment index (1, 2, 3...)
  initiatorRole: ScopeAdjustmentParty;
  initiatorId: string;
  initiatorName: string;
  title: string;
  explanation: string;
  reason: string;
  costAdjustment: number; // Signed delta: positive (+parts/labor) or negative (-scope reduction)
  durationImpact: string; // e.g. "+30 mins", "No impact"
  attachmentUrl?: string; // Base64 data URL for photo evidence
  attachmentName?: string;
  attachmentSize?: number;
  status: ScopeAdjustmentStatus;
  originalJobAmount: number; // Baseline agreed amount prior to this adjustment
  resultingJobAmount: number; // Expected total (originalJobAmount + costAdjustment)
  createdAt: string; // ISO timestamp
  respondedAt?: string;
  responderRole?: ScopeAdjustmentParty;
  responderId?: string;
  responderName?: string;
  responseNote?: string;
}

export interface CreateScopeAdjustmentPayload {
  jobId: string;
  title: string;
  explanation: string;
  reason: string;
  costAdjustment: number;
  durationImpact: string;
  attachment?: {
    name: string;
    dataUrl: string;
    size: number;
  };
}

