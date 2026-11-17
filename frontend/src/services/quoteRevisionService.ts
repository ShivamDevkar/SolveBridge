import type {
  QuoteRevision,
  CreateRevisionRequestPayload,
  SubmitRevisedQuotePayload,
} from '@/types/quoteRevision';

export interface IQuoteRevisionService {
  /**
   * Retrieves all quote revision requests for a specific problem.
   */
  getRevisionsForProblem(problemId: string): Promise<QuoteRevision[]>;

  /**
   * Retrieves all revisions associated with a specific proposal.
   */
  getRevisionsForProposal(proposalId: string): Promise<QuoteRevision[]>;

  /**
   * Retrieves all revisions directed to a professional.
   */
  getRevisionsForProfessional(professionalId: string): Promise<QuoteRevision[]>;

  /**
   * Retrieves a single quote revision by ID.
   */
  getRevisionById(revisionId: string): Promise<QuoteRevision | null>;

  /**
   * Customer initiates a quote revision request for a proposal.
   */
  requestQuoteRevision(
    payload: CreateRevisionRequestPayload,
    customer: { id: string; name: string }
  ): Promise<QuoteRevision>;

  /**
   * Professional submits a revised quote in response to customer request.
   */
  submitRevisedQuote(
    payload: SubmitRevisedQuotePayload,
    professional: { id: string; name: string }
  ): Promise<QuoteRevision>;

  /**
   * Customer accepts a revised quote.
   */
  acceptRevisedQuote(
    revisionId: string,
    customer: { id: string; name: string },
    note?: string
  ): Promise<QuoteRevision>;

  /**
   * Customer declines a revised quote.
   */
  declineRevisedQuote(
    revisionId: string,
    customer: { id: string; name: string },
    reason?: string
  ): Promise<QuoteRevision>;

  /**
   * Initiator cancels or withdraws a pending revision request.
   */
  cancelRevision(revisionId: string, userId: string): Promise<QuoteRevision>;
}

