import type { Problem, CreateProblemPayload, ProblemMetrics, ProblemStatus } from '@/types/problem';

export interface ProblemFilterOptions {
  status?: ProblemStatus | 'ALL';
  searchQuery?: string;
  category?: string;
  urgency?: string;
}

export interface IProblemService {
  /**
   * Retrieves all problems associated with the current customer, with optional filtering.
   */
  getProblems(customerId?: string, filters?: ProblemFilterOptions): Promise<Problem[]>;

  /**
   * Retrieves an individual problem request by ID.
   */
  getProblemById(id: string): Promise<Problem | null>;

  /**
   * Submits and creates a new problem request in the marketplace.
   */
  createProblem(
    payload: CreateProblemPayload,
    customerId: string,
    customerName: string
  ): Promise<Problem>;

  /**
   * Computes summary metrics for customer problem management dashboard.
   */
  getProblemMetrics(customerId?: string): Promise<ProblemMetrics>;

  /**
   * Updates the lifecycle status of a problem request.
   */
  updateProblemStatus?(problemId: string, status: ProblemStatus): Promise<Problem | null>;

  /**
   * Increments the submitted proposals counter for a problem request.
   */
  incrementProposalCount?(problemId: string): Promise<Problem | null>;
}

