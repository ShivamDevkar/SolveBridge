import type { Proposal } from '@/types/proposal';
import type { Job } from '@/types/job';

export interface SubmitProposalPayload {
  problemId: string;
  estimatedPrice: number;
  estimatedDuration: string;
  proposedVisitTime: string;
  initialDiagnosis: string;
  includedServices: string[];
  excludedServices: string[];
  notes?: string;
}

export interface ProIdentitySummary {
  id: string;
  name: string;
  businessName?: string;
  verified: boolean;
  averageRating: number;
  completedJobsCount: number;
  experienceYears: number;
}

export interface CustomerIdentitySummary {
  id: string;
  name: string;
}

export interface ProposalSelectionResult {
  proposal: Proposal;
  job: Job;
  allProblemProposals: Proposal[];
}

export interface IProposalService {
  /**
   * Retrieves all proposals submitted for a specific problem request.
   */
  getProposalsForProblem(problemId: string): Promise<Proposal[]>;

  /**
   * Retrieves a single proposal by its unique ID.
   */
  getProposalById(id: string): Promise<Proposal | null>;

  /**
   * Retrieves all proposals submitted by a specific contractor.
   */
  getProposalsByProfessional(professionalId: string): Promise<Proposal[]>;

  /**
   * Checks whether a contractor has already submitted a proposal for a given problem.
   */
  hasProSubmitted(problemId: string, professionalId: string): Promise<boolean>;

  /**
   * Submits a structured proposal from a professional for an active problem.
   * Enforces duplicate proposal prevention.
   */
  submitProposal(
    payload: SubmitProposalPayload,
    pro: ProIdentitySummary
  ): Promise<Proposal>;

  /**
   * Executes the customer professional selection workflow:
   * 1. Marks the selected proposal as 'ACCEPTED'.
   * 2. Marks competing proposals as 'NOT_SELECTED'.
   * 3. Updates problem status to 'PROFESSIONAL_SELECTED'.
   * 4. Provisions a new simulated Job record.
   */
  selectProposal(
    problemId: string,
    proposalId: string,
    customer: CustomerIdentitySummary
  ): Promise<ProposalSelectionResult>;

  /**
   * Retrieves simulated active jobs created from accepted proposals.
   */
  getJobs(): Promise<Job[]>;

  /**
   * Retrieves a specific simulated job by ID.
   */
  getJobById(jobId: string): Promise<Job | null>;
}

