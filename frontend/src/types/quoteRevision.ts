export type QuoteRevisionStatus =
  | 'PENDING'    // Customer submitted request, awaiting professional response
  | 'REVISED'    // Professional submitted revised quote, awaiting customer decision
  | 'ACCEPTED'   // Customer accepted revised quote
  | 'DECLINED'   // Customer declined revised quote
  | 'CANCELLED'; // Withdrawn or cancelled

export interface QuoteVersionSnapshot {
  version: number;
  estimatedPrice: number;
  estimatedDuration: string;
  includedServices: string[];
  excludedServices: string[];
  notes?: string;
  explanation?: string;
  createdAt: string;
}

export interface QuoteRevision {
  id: string;
  proposalId: string;
  problemId: string;
  customerId: string;
  customerName: string;
  professionalId: string;
  professionalName: string;
  status: QuoteRevisionStatus;

  // What the customer requested
  requestedChanges: string;
  affectedScopeItems?: string[];
  desiredBudget?: number;
  desiredDuration?: string;
  customerRequestedAt: string;

  // Initial baseline quote snapshot
  originalQuote: QuoteVersionSnapshot;

  // Latest revised quote (when status === 'REVISED' | 'ACCEPTED' | 'DECLINED')
  revisedQuote?: QuoteVersionSnapshot;

  // Complete version history
  history: QuoteVersionSnapshot[];

  // Customer decision
  customerRespondedAt?: string;
  customerDecisionNote?: string;
}

export interface CreateRevisionRequestPayload {
  proposalId: string;
  problemId: string;
  requestedChanges: string;
  affectedScopeItems?: string[];
  desiredBudget?: number;
  desiredDuration?: string;
}

export interface SubmitRevisedQuotePayload {
  revisionId: string;
  revisedPrice: number;
  revisedDuration: string;
  includedServices: string[];
  excludedServices: string[];
  explanation: string;
}

