export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';

export type DisputePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type DisputeCategory =
  | 'SERVICE_QUALITY'
  | 'INCOMPLETE_WORK'
  | 'BILLING_DISAGREEMENT'
  | 'PROPERTY_DAMAGE'
  | 'UNPROFESSIONAL_BEHAVIOR'
  | 'UNAUTHORIZED_CHARGE';

export type ArbitrationDecisionType = 'FULL_REFUND' | 'REDO_SERVICE' | 'DISMISS';

export interface ArbitrationDecision {
  decision: ArbitrationDecisionType;
  explanation: string;
  adminNotes?: string;
  resolvedAt: string;
  arbitratorId: string;
  arbitratorName: string;
}

export interface DisputeEventLog {
  id: string;
  timestamp: string;
  action: string;
  actorRole: 'CUSTOMER' | 'PROFESSIONAL' | 'ADMIN';
  actorName: string;
  notes?: string;
}

export interface Dispute {
  id: string; // e.g. DISP-084
  jobId: string;
  problemId?: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  professionalId: string;
  professionalName: string;
  businessName?: string;
  category: DisputeCategory;
  title: string;
  customerComplaint: string;
  professionalResponse?: string;
  status: DisputeStatus;
  priority: DisputePriority;
  disputedAmount: number;
  evidenceUrls: string[];
  arbitrationDecision?: ArbitrationDecision;
  history: DisputeEventLog[];
  createdAt: string;
  updatedAt: string;
}

export interface ResolveDisputePayload {
  disputeId: string;
  decision: ArbitrationDecisionType;
  explanation: string;
  adminNotes?: string;
}

export interface CreateDisputePayload {
  jobId: string;
  category: DisputeCategory;
  title: string;
  customerComplaint: string;
  disputedAmount: number;
  evidenceUrls?: string[];
}

