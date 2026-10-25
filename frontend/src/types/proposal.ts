export type ProposalStatus =
  | 'SUBMITTED'
  | 'VIEWED'
  | 'ACCEPTED'
  | 'NOT_SELECTED'
  | 'EXPIRED'
  | 'WITHDRAWN';

export interface MatchScoreBreakdown {
  overall: number; // e.g. 94%
  skillMatch: number; // 30% weight
  distanceMatch: number; // 25% weight
  availabilityMatch: number; // 20% weight
  ratingMatch: number; // 15% weight
  responseSpeedMatch: number; // 10% weight
}

export interface Proposal {
  id: string;
  problemId: string;
  professionalId: string;
  professionalName: string;
  businessName?: string;
  verified: boolean;
  averageRating: number;
  completedJobsCount: number;
  experienceYears: number;
  estimatedPrice: number;
  estimatedDuration: string;
  proposedVisitTime: string;
  initialDiagnosis: string;
  includedServices: string[];
  excludedServices: string[];
  notes?: string;
  matchScore: MatchScoreBreakdown;
  status: ProposalStatus;
  validUntil: string;
  createdAt: string;
}
