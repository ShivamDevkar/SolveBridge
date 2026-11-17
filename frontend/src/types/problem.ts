import { UrgencyLevel } from './common';

export type ProblemStatus =
  | 'OPEN'
  | 'PROPOSALS_RECEIVED'
  | 'PROFESSIONAL_SELECTED'
  | 'CLOSED'
  | 'CANCELLED';

export interface ProblemLocation {
  city: string;
  neighborhood: string;
  distanceKm?: number;
  // Masked for professional discovery; exact address revealed only upon proposal acceptance in Job Workspace
  maskedAddress: string;
  fullAddress?: string;
}

export interface Problem {
  id: string;
  customerId: string;
  customerName: string;
  title: string;
  description: string;
  category: string;
  urgency: UrgencyLevel;
  location: ProblemLocation;
  budgetMin?: number;
  budgetMax?: number;
  preferredDate: string;
  preferredTimeWindow: string;
  mediaUrls: string[];
  status: ProblemStatus;
  proposalsCount: number;
  createdAt: string;
}

export interface CreateProblemPayload {
  title: string;
  description: string;
  category?: string;
  mediaUrls: string[];
  city: string;
  neighborhood: string;
  landmark?: string;
  urgency: UrgencyLevel;
  preferredDate: string;
  preferredTimeWindow: string;
  budgetMin?: number;
  budgetMax?: number;
}

export interface ProblemMetrics {
  activeProblems: number;
  incomingProposals: number;
  jobsInProgress: number;
  resolvedCount: number;
}
