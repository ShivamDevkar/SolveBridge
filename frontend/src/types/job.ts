/**
 * Core Job Lifecycle Status
 * Note on Unresolved Decision #1:
 * - Option A: COMPLETED -> CUSTOMER_CONFIRMED -> CLOSED (Review is an independent action linked to the Job record).
 * - Option B: COMPLETED -> CUSTOMER_CONFIRMED -> REVIEW_PENDING -> CLOSED (Review is a formal lifecycle status).
 * In all options, CUSTOMER_CONFIRMED is strictly required before final job closure.
 */
export type JobLifecycleStatus =
  | 'POSTED'
  | 'SCHEDULED'
  | 'ON_THE_WAY'
  | 'ARRIVED'
  | 'INSPECTION'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CUSTOMER_CONFIRMED'
  | 'REVIEW_PENDING' // Option B candidate
  | 'CLOSED'
  | 'CANCELLED'
  | 'DISPUTED'
  | 'REFUNDED';

export interface Job {
  id: string;
  problemId: string;
  proposalId: string;
  customerId: string;
  customerName: string;
  professionalId: string;
  professionalName: string;
  category: string;
  title: string;
  scheduledAt: string;
  status: JobLifecycleStatus;
  originalAmount: number;
  currentAmount: number;
  // Exact address is only accessible inside active Job Workspace to assigned participants
  exactServiceAddress: string;
  startedAt?: string;
  completedAt?: string;
  customerConfirmedAt?: string;
  closedAt?: string;
  createdAt: string;
}
