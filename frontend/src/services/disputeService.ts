import type {
  Dispute,
  ResolveDisputePayload,
  CreateDisputePayload,
  DisputeStatus,
  DisputePriority,
} from '@/types/dispute';

export interface DisputeFilterOptions {
  status?: DisputeStatus | 'ALL';
  priority?: DisputePriority | 'ALL';
  searchQuery?: string;
}

export interface IDisputeService {
  /**
   * Retrieves all disputes with optional status or text filters.
   */
  getDisputes(filters?: DisputeFilterOptions): Promise<Dispute[]>;

  /**
   * Retrieves a single dispute record by its ID.
   */
  getDisputeById(disputeId: string): Promise<Dispute | null>;

  /**
   * Retrieves any dispute associated with a given Job ID.
   */
  getDisputeByJobId(jobId: string): Promise<Dispute | null>;

  /**
   * Opens a new formal dispute grievance on a job.
   */
  createDispute(
    payload: CreateDisputePayload,
    customer: { id: string; name: string }
  ): Promise<Dispute>;

  /**
   * Administrative arbitration resolution.
   */
  resolveDispute(
    payload: ResolveDisputePayload,
    admin: { id: string; name: string }
  ): Promise<Dispute>;

  /**
   * Records a professional's formal response to an open customer dispute.
   */
  recordProfessionalResponse(
    disputeId: string,
    response: string,
    pro: { id: string; name: string }
  ): Promise<Dispute>;
}
