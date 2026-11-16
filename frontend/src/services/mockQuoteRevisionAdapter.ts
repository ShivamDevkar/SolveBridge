// [DEV-ONLY FIXTURE]: Client-side quote revision prototype simulation.
// Does NOT provide production security or backend persistence.

import type {
  QuoteRevision,
  QuoteVersionSnapshot,
  CreateRevisionRequestPayload,
  SubmitRevisedQuotePayload,
} from '@/types/quoteRevision';
import type { IQuoteRevisionService } from './quoteRevisionService';

const STORAGE_REVISIONS_KEY = 'solvebid_mock_quote_revisions';
const SIMULATED_LATENCY_MS = typeof process !== 'undefined' && process.env.NODE_ENV === 'test' ? 0 : 200;

function delay(ms = SIMULATED_LATENCY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const SEED_ORIGINAL_QUOTE_852: QuoteVersionSnapshot = {
  version: 1,
  estimatedPrice: 1200,
  estimatedDuration: '2 hours',
  includedServices: [
    'Initial pipe inspection',
    'Leak localization and moisture check',
    'Pipe joint tightening',
  ],
  excludedServices: ['Parts replacement', 'Deep wall opening'],
  notes: 'Standard diagnostic and basic joint sealing service.',
  createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
};

const SEED_REVISED_QUOTE_852: QuoteVersionSnapshot = {
  version: 2,
  estimatedPrice: 1000,
  estimatedDuration: '1.5 hours',
  includedServices: [
    'Initial pipe inspection',
    'Leak localization and moisture check',
    'Pipe joint tightening',
    'Pipe pressure testing and replacement of main stopcock washer',
  ],
  excludedServices: ['Deep wall opening'],
  notes: 'Revised quote incorporating customer request for pressure test and stopcock washer.',
  explanation: 'Discounted diagnostic fee to ₹1,000 and bundled the pressure test and stopcock washer replacement as requested.',
  createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
};

export const INITIAL_SEED_REVISIONS: QuoteRevision[] = [
  {
    id: 'REV-00852-1',
    proposalId: 'PROP-00852-1',
    problemId: 'PB-00852',
    customerId: 'user-demo-customer',
    customerName: 'Sarthak Chavan',
    professionalId: 'user-demo-pro',
    professionalName: 'Arun HVAC Services (Arun Kumar)',
    status: 'REVISED',
    requestedChanges: 'Can you include a comprehensive pipe pressure test and replace the washer for the main stopcock in the quoted price?',
    affectedScopeItems: ['Stopcock inspection', 'Pressure test'],
    desiredBudget: 1000,
    desiredDuration: '1.5 hours',
    customerRequestedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    originalQuote: SEED_ORIGINAL_QUOTE_852,
    revisedQuote: SEED_REVISED_QUOTE_852,
    history: [SEED_ORIGINAL_QUOTE_852, SEED_REVISED_QUOTE_852],
  },
];

export class MockQuoteRevisionAdapter implements IQuoteRevisionService {
  private revisions: QuoteRevision[] = [];

  constructor() {
    this.reloadFromStorage();
  }

  private isStorageAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  private reloadFromStorage(): void {
    if (this.isStorageAvailable()) {
      try {
        const stored = window.localStorage.getItem(STORAGE_REVISIONS_KEY);
        if (stored) {
          this.revisions = JSON.parse(stored);
          return;
        }
      } catch (err) {
        console.warn('Failed to parse mock quote revisions from localStorage:', err);
      }
    }
    this.revisions = JSON.parse(JSON.stringify(INITIAL_SEED_REVISIONS));
    this.persistToStorage();
  }

  private persistToStorage(): void {
    if (this.isStorageAvailable()) {
      try {
        window.localStorage.setItem(STORAGE_REVISIONS_KEY, JSON.stringify(this.revisions));
      } catch (err) {
        console.warn('Failed to persist mock quote revisions to localStorage:', err);
      }
    }
  }

  public async getRevisionsForProblem(problemId: string): Promise<QuoteRevision[]> {
    await delay();
    this.reloadFromStorage();
    return this.revisions
      .filter((r) => r.problemId.toUpperCase() === problemId.toUpperCase())
      .sort((a, b) => new Date(b.customerRequestedAt).getTime() - new Date(a.customerRequestedAt).getTime());
  }

  public async getRevisionsForProposal(proposalId: string): Promise<QuoteRevision[]> {
    await delay();
    this.reloadFromStorage();
    return this.revisions
      .filter((r) => r.proposalId.toUpperCase() === proposalId.toUpperCase())
      .sort((a, b) => new Date(b.customerRequestedAt).getTime() - new Date(a.customerRequestedAt).getTime());
  }

  public async getRevisionsForProfessional(professionalId: string): Promise<QuoteRevision[]> {
    await delay();
    this.reloadFromStorage();
    return this.revisions
      .filter((r) => r.professionalId === professionalId)
      .sort((a, b) => new Date(b.customerRequestedAt).getTime() - new Date(a.customerRequestedAt).getTime());
  }

  public async getRevisionById(revisionId: string): Promise<QuoteRevision | null> {
    await delay(SIMULATED_LATENCY_MS > 0 ? 50 : 0);
    this.reloadFromStorage();
    const found = this.revisions.find((r) => r.id === revisionId);
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  public async requestQuoteRevision(
    payload: CreateRevisionRequestPayload,
    customer: { id: string; name: string }
  ): Promise<QuoteRevision> {
    await delay();
    this.reloadFromStorage();

    if (!payload.requestedChanges || payload.requestedChanges.trim().length < 10) {
      throw new Error('Please provide a detailed explanation of the requested revision (at least 10 characters).');
    }

    // Check for existing pending/revised request for this proposal
    const existingActive = this.revisions.find(
      (r) =>
        r.proposalId.toUpperCase() === payload.proposalId.toUpperCase() &&
        (r.status === 'PENDING' || r.status === 'REVISED')
    );
    if (existingActive) {
      throw new Error('An active quote revision is already pending for this proposal.');
    }

    // Get proposal snapshot from global proposal adapter if available
    let originalSnapshot: QuoteVersionSnapshot = {
      version: 1,
      estimatedPrice: payload.desiredBudget || 1000,
      estimatedDuration: payload.desiredDuration || '1–2 hours',
      includedServices: ['Standard Diagnostic Service'],
      excludedServices: ['Parts & replacements'],
      createdAt: new Date().toISOString(),
    };
    let proId = 'user-demo-pro';
    let proName = 'Professional Service';

    const globalProposalAdapter =
      typeof globalThis !== 'undefined' ? (globalThis as any).__solvebid_proposal_adapter : null;
    if (globalProposalAdapter && typeof globalProposalAdapter.getProposalById === 'function') {
      try {
        const prop = await globalProposalAdapter.getProposalById(payload.proposalId);
        if (prop) {
          proId = prop.professionalId;
          proName = prop.businessName || prop.professionalName;
          originalSnapshot = {
            version: 1,
            estimatedPrice: prop.estimatedPrice,
            estimatedDuration: prop.estimatedDuration,
            includedServices: [...prop.includedServices],
            excludedServices: [...prop.excludedServices],
            notes: prop.notes,
            createdAt: prop.createdAt || new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('Could not read proposal snapshot from global adapter:', err);
      }
    }

    const newRevision: QuoteRevision = {
      id: `REV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      proposalId: payload.proposalId,
      problemId: payload.problemId,
      customerId: customer.id,
      customerName: customer.name,
      professionalId: proId,
      professionalName: proName,
      status: 'PENDING',
      requestedChanges: payload.requestedChanges.trim(),
      affectedScopeItems: payload.affectedScopeItems || [],
      desiredBudget: payload.desiredBudget,
      desiredDuration: payload.desiredDuration,
      customerRequestedAt: new Date().toISOString(),
      originalQuote: originalSnapshot,
      history: [originalSnapshot],
    };

    this.revisions.push(newRevision);
    this.persistToStorage();

    return JSON.parse(JSON.stringify(newRevision));
  }

  public async submitRevisedQuote(
    payload: SubmitRevisedQuotePayload,
    _professional: { id: string; name: string }
  ): Promise<QuoteRevision> {
    await delay();
    this.reloadFromStorage();

    const revision = this.revisions.find((r) => r.id === payload.revisionId);
    if (!revision) {
      throw new Error(`Quote revision "${payload.revisionId}" not found.`);
    }

    if (revision.status !== 'PENDING') {
      throw new Error(`Cannot revise quote: current status is "${revision.status}".`);
    }

    if (!payload.revisedPrice || payload.revisedPrice <= 0) {
      throw new Error('Revised price must be greater than zero.');
    }

    if (!payload.explanation || payload.explanation.trim().length < 10) {
      throw new Error('Please provide a clear explanation of changes made (at least 10 characters).');
    }

    const nextVersionNumber = revision.history.length + 1;
    const revisedSnapshot: QuoteVersionSnapshot = {
      version: nextVersionNumber,
      estimatedPrice: payload.revisedPrice,
      estimatedDuration: payload.revisedDuration || revision.originalQuote.estimatedDuration,
      includedServices: payload.includedServices && payload.includedServices.length > 0
        ? payload.includedServices
        : [...revision.originalQuote.includedServices],
      excludedServices: payload.excludedServices
        ? payload.excludedServices
        : [...revision.originalQuote.excludedServices],
      explanation: payload.explanation.trim(),
      createdAt: new Date().toISOString(),
    };

    revision.revisedQuote = revisedSnapshot;
    revision.history.push(revisedSnapshot);
    revision.status = 'REVISED';
    this.persistToStorage();

    // Synchronize underlying proposal if adapter is available
    const globalProposalAdapter =
      typeof globalThis !== 'undefined' ? (globalThis as any).__solvebid_proposal_adapter : null;
    if (globalProposalAdapter && typeof globalProposalAdapter.updateProposalQuote === 'function') {
      try {
        await globalProposalAdapter.updateProposalQuote(revision.proposalId, {
          estimatedPrice: payload.revisedPrice,
          estimatedDuration: revisedSnapshot.estimatedDuration,
          includedServices: revisedSnapshot.includedServices,
          excludedServices: revisedSnapshot.excludedServices,
        });
      } catch (err) {
        console.warn('Could not sync updated quote to proposal adapter:', err);
      }
    }

    return JSON.parse(JSON.stringify(revision));
  }

  public async acceptRevisedQuote(
    revisionId: string,
    _customer: { id: string; name: string },
    note?: string
  ): Promise<QuoteRevision> {
    await delay();
    this.reloadFromStorage();

    const revision = this.revisions.find((r) => r.id === revisionId);
    if (!revision) {
      throw new Error(`Quote revision "${revisionId}" not found.`);
    }

    if (revision.status !== 'REVISED') {
      throw new Error(`Cannot accept quote revision: current status is "${revision.status}".`);
    }

    revision.status = 'ACCEPTED';
    revision.customerRespondedAt = new Date().toISOString();
    if (note) revision.customerDecisionNote = note;

    this.persistToStorage();
    return JSON.parse(JSON.stringify(revision));
  }

  public async declineRevisedQuote(
    revisionId: string,
    _customer: { id: string; name: string },
    reason?: string
  ): Promise<QuoteRevision> {
    await delay();
    this.reloadFromStorage();

    const revision = this.revisions.find((r) => r.id === revisionId);
    if (!revision) {
      throw new Error(`Quote revision "${revisionId}" not found.`);
    }

    if (revision.status !== 'REVISED') {
      throw new Error(`Cannot decline quote revision: current status is "${revision.status}".`);
    }

    revision.status = 'DECLINED';
    revision.customerRespondedAt = new Date().toISOString();
    if (reason) revision.customerDecisionNote = reason;

    this.persistToStorage();
    return JSON.parse(JSON.stringify(revision));
  }

  public async cancelRevision(revisionId: string, _userId: string): Promise<QuoteRevision> {
    await delay();
    this.reloadFromStorage();

    const revision = this.revisions.find((r) => r.id === revisionId);
    if (!revision) {
      throw new Error(`Quote revision "${revisionId}" not found.`);
    }

    if (revision.status !== 'PENDING') {
      throw new Error(`Only pending revisions can be cancelled. Current status is "${revision.status}".`);
    }

    revision.status = 'CANCELLED';
    this.persistToStorage();
    return JSON.parse(JSON.stringify(revision));
  }

  public __resetToSeed(): void {
    this.revisions = JSON.parse(JSON.stringify(INITIAL_SEED_REVISIONS));
    this.persistToStorage();
  }

  public __injectRevision(revision: QuoteRevision): void {
    this.revisions.push(revision);
    this.persistToStorage();
  }
}

export const mockQuoteRevisionAdapter = new MockQuoteRevisionAdapter();

if (typeof globalThis !== 'undefined') {
  (globalThis as any).__solvebid_quote_revision_adapter = mockQuoteRevisionAdapter;
}

