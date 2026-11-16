// [DEV-ONLY FIXTURE]: Client-side post-acceptance scope adjustment prototype simulation.
// Does NOT provide production security or backend persistence.

import type {
  ScopeAdjustment,
  CreateScopeAdjustmentPayload,
  ScopeAdjustmentParty,
} from '@/types/scopeAdjustment';
import type { IScopeAdjustmentService } from './scopeAdjustmentService';

const STORAGE_ADJUSTMENTS_KEY = 'solvebid_mock_scope_adjustments';
const SIMULATED_LATENCY_MS = typeof process !== 'undefined' && process.env.NODE_ENV === 'test' ? 0 : 200;

function delay(ms = SIMULATED_LATENCY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const INITIAL_SEED_ADJUSTMENTS: ScopeAdjustment[] = [
  {
    id: 'ADJ-00847-1',
    jobId: 'JOB-00847',
    adjustmentNumber: 1,
    initiatorRole: 'PROFESSIONAL',
    initiatorId: 'user-demo-pro',
    initiatorName: 'Arun HVAC Services (Arun Kumar)',
    title: 'Dual-Run Capacitor Replacement & Contactor Cleaning',
    explanation: 'Supply and install high-durability 45/5μF dual-run capacitor and clean oxidized contactor terminals to restore full compressor starting torque.',
    reason: 'Discovered during electrical diagnostic that run capacitor capacitance has degraded below safety threshold (12μF vs 45μF rated). Requires immediate replacement to prevent compressor winding burnout.',
    costAdjustment: 450,
    durationImpact: '+30 minutes',
    attachmentName: 'bulged_capacitor_multimeter_reading.jpg',
    status: 'PENDING',
    originalJobAmount: 900,
    resultingJobAmount: 1350,
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
];

export class MockScopeAdjustmentAdapter implements IScopeAdjustmentService {
  private adjustments: ScopeAdjustment[] = [];

  constructor() {
    this.reloadFromStorage();
  }

  private isStorageAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  private reloadFromStorage(): void {
    if (this.isStorageAvailable()) {
      try {
        const stored = window.localStorage.getItem(STORAGE_ADJUSTMENTS_KEY);
        if (stored) {
          this.adjustments = JSON.parse(stored);
          return;
        }
      } catch (err) {
        console.warn('Failed to parse mock scope adjustments from localStorage:', err);
      }
    }
    this.adjustments = JSON.parse(JSON.stringify(INITIAL_SEED_ADJUSTMENTS));
    this.persistToStorage();
  }

  private persistToStorage(): void {
    if (this.isStorageAvailable()) {
      try {
        window.localStorage.setItem(STORAGE_ADJUSTMENTS_KEY, JSON.stringify(this.adjustments));
      } catch (err) {
        console.warn('Failed to persist mock scope adjustments to localStorage:', err);
      }
    }
  }

  public async getAdjustmentsForJob(jobId: string): Promise<ScopeAdjustment[]> {
    await delay();
    this.reloadFromStorage();
    return this.adjustments
      .filter((a) => a.jobId.toUpperCase() === jobId.toUpperCase())
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public async getAdjustmentById(adjustmentId: string): Promise<ScopeAdjustment | null> {
    await delay(SIMULATED_LATENCY_MS > 0 ? 50 : 0);
    this.reloadFromStorage();
    const found = this.adjustments.find((a) => a.id === adjustmentId);
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  public async requestScopeAdjustment(
    payload: CreateScopeAdjustmentPayload,
    initiator: { id: string; name: string; role: ScopeAdjustmentParty }
  ): Promise<ScopeAdjustment> {
    await delay();
    this.reloadFromStorage();

    if (!payload.title || payload.title.trim().length < 5) {
      throw new Error('Please provide an adjustment title (at least 5 characters).');
    }

    if (!payload.explanation || payload.explanation.trim().length < 10) {
      throw new Error('Please provide a detailed explanation of the requested work (at least 10 characters).');
    }

    if (!payload.reason || payload.reason.trim().length < 10) {
      throw new Error('Please provide the justification or discovery reason (at least 10 characters).');
    }

    // Determine current job agreed amount
    let currentJobAmount = 900;
    const globalJobAdapter =
      typeof globalThis !== 'undefined' ? (globalThis as any).__solvebid_job_adapter : null;
    if (globalJobAdapter && typeof globalJobAdapter.getJobById === 'function') {
      try {
        const job = await globalJobAdapter.getJobById(payload.jobId);
        if (job) {
          currentJobAmount = job.currentAmount;
        }
      } catch (err) {
        console.warn('Could not read current job amount from adapter:', err);
      }
    }

    const jobAdjustments = this.adjustments.filter(
      (a) => a.jobId.toUpperCase() === payload.jobId.toUpperCase()
    );
    const adjustmentNumber = jobAdjustments.length + 1;
    const resultingAmount = Math.max(0, currentJobAmount + (payload.costAdjustment || 0));

    const newAdjustment: ScopeAdjustment = {
      id: `ADJ-${payload.jobId.replace('JOB-', '')}-${adjustmentNumber}`,
      jobId: payload.jobId,
      adjustmentNumber,
      initiatorRole: initiator.role,
      initiatorId: initiator.id,
      initiatorName: initiator.name,
      title: payload.title.trim(),
      explanation: payload.explanation.trim(),
      reason: payload.reason.trim(),
      costAdjustment: payload.costAdjustment || 0,
      durationImpact: payload.durationImpact || 'No duration change',
      attachmentUrl: payload.attachment?.dataUrl,
      attachmentName: payload.attachment?.name,
      attachmentSize: payload.attachment?.size,
      status: 'PENDING',
      originalJobAmount: currentJobAmount,
      resultingJobAmount: resultingAmount,
      createdAt: new Date().toISOString(),
    };

    this.adjustments.push(newAdjustment);
    this.persistToStorage();

    // Add activity log to job workspace if available
    if (globalJobAdapter && typeof globalJobAdapter.addProgressUpdate === 'function') {
      try {
        const costStr =
          payload.costAdjustment >= 0
            ? `+₹${payload.costAdjustment.toLocaleString()}`
            : `-₹${Math.abs(payload.costAdjustment).toLocaleString()}`;
        await globalJobAdapter.addProgressUpdate(
          payload.jobId,
          `Scope Adjustment #${adjustmentNumber} Proposed: ${payload.title.trim()} (${costStr})`,
          {
            id: initiator.id,
            name: initiator.name,
            role: initiator.role,
          }
        );
      } catch (err) {
        console.warn('Could not log scope adjustment to job activity feed:', err);
      }
    }

    return JSON.parse(JSON.stringify(newAdjustment));
  }

  public async respondToScopeAdjustment(
    adjustmentId: string,
    decision: 'ACCEPT' | 'DECLINE',
    responder: { id: string; name: string; role: ScopeAdjustmentParty },
    responseNote?: string
  ): Promise<ScopeAdjustment> {
    await delay();
    this.reloadFromStorage();

    const adj = this.adjustments.find((a) => a.id === adjustmentId);
    if (!adj) {
      throw new Error(`Scope adjustment "${adjustmentId}" not found.`);
    }

    if (adj.status !== 'PENDING') {
      throw new Error(`Scope adjustment is already ${adj.status.toLowerCase()}.`);
    }

    // Role check: Only counterparty can respond
    if (adj.initiatorRole === responder.role) {
      throw new Error(`You cannot respond to your own requested adjustment. Waiting for the ${adj.initiatorRole === 'PROFESSIONAL' ? 'Customer' : 'Professional'}.`);
    }

    adj.status = decision === 'ACCEPT' ? 'ACCEPTED' : 'DECLINED';
    adj.respondedAt = new Date().toISOString();
    adj.responderRole = responder.role;
    adj.responderId = responder.id;
    adj.responderName = responder.name;
    if (responseNote) adj.responseNote = responseNote.trim();

    this.persistToStorage();

    // If ACCEPTED, apply to currentAmount in job adapter (originalAmount remains intact!)
    const globalJobAdapter =
      typeof globalThis !== 'undefined' ? (globalThis as any).__solvebid_job_adapter : null;

    if (decision === 'ACCEPT' && globalJobAdapter) {
      try {
        const job = await globalJobAdapter.getJobById(adj.jobId);
        if (job) {
          job.currentAmount = adj.resultingJobAmount;
          if (typeof globalJobAdapter.setJob === 'function') {
            globalJobAdapter.setJob(job);
          }
        }
      } catch (err) {
        console.warn('Could not update job current amount on adjustment acceptance:', err);
      }
    }

    // Add activity log to job workspace
    if (globalJobAdapter && typeof globalJobAdapter.addProgressUpdate === 'function') {
      try {
        const actionLabel = decision === 'ACCEPT' ? 'Approved' : 'Declined';
        await globalJobAdapter.addProgressUpdate(
          adj.jobId,
          `Scope Adjustment #${adj.adjustmentNumber} ${actionLabel} by ${responder.name}: ${adj.title}`,
          {
            id: responder.id,
            name: responder.name,
            role: responder.role,
          }
        );
      } catch (err) {
        console.warn('Could not log scope adjustment response to activity feed:', err);
      }
    }

    return JSON.parse(JSON.stringify(adj));
  }

  public async cancelScopeAdjustment(adjustmentId: string, userId: string): Promise<ScopeAdjustment> {
    await delay();
    this.reloadFromStorage();

    const adj = this.adjustments.find((a) => a.id === adjustmentId);
    if (!adj) {
      throw new Error(`Scope adjustment "${adjustmentId}" not found.`);
    }

    if (adj.status !== 'PENDING') {
      throw new Error(`Only pending adjustments can be cancelled. Current status is "${adj.status}".`);
    }

    if (adj.initiatorId !== userId) {
      throw new Error('Only the initiator can cancel this adjustment.');
    }

    adj.status = 'CANCELLED';
    this.persistToStorage();
    return JSON.parse(JSON.stringify(adj));
  }

  public __resetToSeed(): void {
    this.adjustments = JSON.parse(JSON.stringify(INITIAL_SEED_ADJUSTMENTS));
    this.persistToStorage();
  }

  public __injectAdjustment(adj: ScopeAdjustment): void {
    this.adjustments.push(adj);
    this.persistToStorage();
  }
}

export const mockScopeAdjustmentAdapter = new MockScopeAdjustmentAdapter();

if (typeof globalThis !== 'undefined') {
  (globalThis as any).__solvebid_scope_adjustment_adapter = mockScopeAdjustmentAdapter;
}

