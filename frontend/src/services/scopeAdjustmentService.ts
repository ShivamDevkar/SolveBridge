import type {
  ScopeAdjustment,
  CreateScopeAdjustmentPayload,
  ScopeAdjustmentParty,
} from '@/types/scopeAdjustment';

export interface IScopeAdjustmentService {
  /**
   * Retrieves all scope adjustments for a job in chronological order.
   */
  getAdjustmentsForJob(jobId: string): Promise<ScopeAdjustment[]>;

  /**
   * Retrieves a single scope adjustment by ID.
   */
  getAdjustmentById(adjustmentId: string): Promise<ScopeAdjustment | null>;

  /**
   * Creates a new scope adjustment request (can be initiated by customer or professional).
   */
  requestScopeAdjustment(
    payload: CreateScopeAdjustmentPayload,
    initiator: { id: string; name: string; role: ScopeAdjustmentParty }
  ): Promise<ScopeAdjustment>;

  /**
   * Responds to an adjustment request (ACCEPT or DECLINE).
   */
  respondToScopeAdjustment(
    adjustmentId: string,
    decision: 'ACCEPT' | 'DECLINE',
    responder: { id: string; name: string; role: ScopeAdjustmentParty },
    responseNote?: string
  ): Promise<ScopeAdjustment>;

  /**
   * Cancels a pending scope adjustment (initiator only).
   */
  cancelScopeAdjustment(adjustmentId: string, userId: string): Promise<ScopeAdjustment>;
}

