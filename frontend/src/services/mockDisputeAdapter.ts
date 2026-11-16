// [DEV-ONLY FIXTURE]: Client-side dispute arbitration prototype simulation.
// Does NOT execute server-side arbitration or real payment refunds.

import type {
  Dispute,
  ResolveDisputePayload,
  CreateDisputePayload,
  DisputeStatus,
  ArbitrationDecision,
} from '@/types/dispute';
import type { IDisputeService, DisputeFilterOptions } from './disputeService';

const STORAGE_DISPUTES_KEY = 'solvebid_mock_disputes';
const SIMULATED_LATENCY_MS = typeof process !== 'undefined' && process.env.NODE_ENV === 'test' ? 0 : 200;

function delay(ms = SIMULATED_LATENCY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const INITIAL_SEED_DISPUTES: Dispute[] = [
  {
    id: 'DISP-084',
    jobId: 'JOB-00847',
    problemId: 'PB-00847',
    customerId: 'user-demo-customer',
    customerName: 'Sarthak Chavan',
    customerEmail: 'customer@solvebid.demo',
    customerPhone: '+91 98765 43210',
    professionalId: 'user-demo-pro',
    professionalName: 'Arun Kumar',
    businessName: 'Arun HVAC Services',
    category: 'SERVICE_QUALITY',
    title: 'Cooling failed 24 hours after capacitor replacement',
    customerComplaint:
      'Contractor replaced the dual-run capacitor yesterday and charged ₹1,350 total. However, the cooling performance has not improved, room temperature remains at 29°C, and the outdoor unit trips on thermal overload every 20 minutes.',
    professionalResponse:
      'The original capacitor was measured at 12μF against a 45μF rating and had to be replaced to prevent compressor burnout. However, upon testing, outdoor condenser coil fins were found to be choked with heavy construction dust from across the street, causing high head pressure and thermal cutout.',
    status: 'OPEN',
    priority: 'HIGH',
    disputedAmount: 1350,
    evidenceUrls: [],
    history: [
      {
        id: 'DH-01',
        timestamp: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
        action: 'DISPUTE_FILED',
        actorRole: 'CUSTOMER',
        actorName: 'Sarthak Chavan',
        notes: 'Dispute opened via Job Workspace dispute resolution center.',
      },
      {
        id: 'DH-02',
        timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        action: 'RESPONSE_SUBMITTED',
        actorRole: 'PROFESSIONAL',
        actorName: 'Arun Kumar',
        notes: 'Professional submitted technical explanation citing choked condenser coil.',
      },
    ],
    createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    id: 'DISP-072',
    jobId: 'JOB-00831',
    problemId: 'PB-00831',
    customerId: 'user-demo-customer',
    customerName: 'Sarthak Chavan',
    customerEmail: 'customer@solvebid.demo',
    customerPhone: '+91 98765 43210',
    professionalId: 'pro-precision-elec',
    professionalName: 'Mahesh Patil',
    businessName: 'Pune Precision Electricals',
    category: 'BILLING_DISAGREEMENT',
    title: 'Dispute over billing for extra copper wire meterage',
    customerComplaint:
      'Final quote adjustment charged for 15 meters of 4mm copper wire, but physical conduit measurement indicates only 8 meters was required.',
    professionalResponse:
      'Conduit routing required circuitous loop around hot water piping to satisfy Indian standard electrical separation regulations.',
    status: 'UNDER_REVIEW',
    priority: 'MEDIUM',
    disputedAmount: 600,
    evidenceUrls: [],
    history: [
      {
        id: 'DH-03',
        timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        action: 'DISPUTE_FILED',
        actorRole: 'CUSTOMER',
        actorName: 'Sarthak Chavan',
      },
    ],
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
  },
  {
    id: 'DISP-065',
    jobId: 'JOB-00790',
    problemId: 'PB-00790',
    customerId: 'user-demo-customer',
    customerName: 'Sarthak Chavan',
    customerEmail: 'customer@solvebid.demo',
    customerPhone: '+91 98765 43210',
    professionalId: 'pro-quickchill',
    professionalName: 'Suresh Nair',
    businessName: 'QuickChill HVAC Solutions',
    category: 'SERVICE_QUALITY',
    title: 'Minor cosmetic scratch on compressor faceplate',
    customerComplaint: 'Customer requested minor discount due to small scratch on exterior casing.',
    status: 'RESOLVED',
    priority: 'LOW',
    disputedAmount: 250,
    evidenceUrls: [],
    arbitrationDecision: {
      decision: 'DISMISS',
      explanation: 'Photographic evidence from initial diagnostic visit showed the scratch was pre-existing.',
      adminNotes: 'Dismissed after verifying pre-service intake checklist.',
      resolvedAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
      arbitratorId: 'user-demo-admin',
      arbitratorName: 'Chief Administrator',
    },
    history: [
      {
        id: 'DH-04',
        timestamp: new Date(Date.now() - 90 * 3600 * 1000).toISOString(),
        action: 'DISPUTE_FILED',
        actorRole: 'CUSTOMER',
        actorName: 'Sarthak Chavan',
      },
      {
        id: 'DH-05',
        timestamp: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
        action: 'ARBITRATION_COMPLETED',
        actorRole: 'ADMIN',
        actorName: 'Chief Administrator',
        notes: 'Decision: DISMISS',
      },
    ],
    createdAt: new Date(Date.now() - 90 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
  },
];

export class MockDisputeAdapter implements IDisputeService {
  private disputes: Dispute[] = [];

  constructor() {
    this.reloadFromStorage();
  }

  private isStorageAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  private reloadFromStorage(): void {
    if (this.isStorageAvailable()) {
      try {
        const stored = window.localStorage.getItem(STORAGE_DISPUTES_KEY);
        if (stored) {
          this.disputes = JSON.parse(stored);
          return;
        }
      } catch (err) {
        console.warn('Failed to parse mock disputes from localStorage:', err);
      }
    }
    // Non-browser (Node.js / unit testing) environment:
    // Only initialize from seed data if not yet populated in-memory.
    if (!this.disputes || this.disputes.length === 0) {
      this.disputes = JSON.parse(JSON.stringify(INITIAL_SEED_DISPUTES));
    }
  }

  private persistToStorage(): void {
    if (this.isStorageAvailable()) {
      try {
        window.localStorage.setItem(STORAGE_DISPUTES_KEY, JSON.stringify(this.disputes));
      } catch (err) {
        console.warn('Failed to persist mock disputes to localStorage:', err);
      }
    }
  }

  public async getDisputes(filters?: DisputeFilterOptions): Promise<Dispute[]> {
    await delay();
    this.reloadFromStorage();

    return this.disputes.filter((d) => {
      if (filters?.status && filters.status !== 'ALL') {
        if (d.status !== filters.status) return false;
      }
      if (filters?.priority && filters.priority !== 'ALL') {
        if (d.priority !== filters.priority) return false;
      }
      if (filters?.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matches =
          d.id.toLowerCase().includes(q) ||
          d.jobId.toLowerCase().includes(q) ||
          d.customerName.toLowerCase().includes(q) ||
          d.professionalName.toLowerCase().includes(q) ||
          d.title.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }

  public async getDisputeById(disputeId: string): Promise<Dispute | null> {
    await delay(SIMULATED_LATENCY_MS > 0 ? 50 : 0);
    this.reloadFromStorage();
    const found = this.disputes.find(
      (d) => d.id.toUpperCase() === disputeId.trim().toUpperCase()
    );
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  public async getDisputeByJobId(jobId: string): Promise<Dispute | null> {
    await delay(SIMULATED_LATENCY_MS > 0 ? 50 : 0);
    this.reloadFromStorage();
    const found = this.disputes.find(
      (d) => d.jobId.toUpperCase() === jobId.trim().toUpperCase()
    );
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  public async createDispute(
    payload: CreateDisputePayload,
    customer: { id: string; name: string }
  ): Promise<Dispute> {
    await delay();
    this.reloadFromStorage();

    if (!payload.jobId || !payload.jobId.trim()) {
      throw new Error('Job ID is required to open a dispute.');
    }
    if (!payload.title || payload.title.trim().length < 5) {
      throw new Error('Dispute title must contain at least 5 characters.');
    }
    if (!payload.customerComplaint || payload.customerComplaint.trim().length < 10) {
      throw new Error('Please describe your grievance in detail (at least 10 characters).');
    }
    if (typeof payload.disputedAmount === 'number' && payload.disputedAmount <= 0) {
      throw new Error('Disputed amount must be greater than 0.');
    }

    const cleanJobId = payload.jobId.trim().toUpperCase();
    const existing = this.disputes.find(
      (d) => d.jobId.toUpperCase() === cleanJobId && (d.status === 'OPEN' || d.status === 'UNDER_REVIEW')
    );
    if (existing) {
      throw new Error(`An active dispute (#${existing.id}) already exists for Job #${payload.jobId}.`);
    }

    // Attempt to lookup job for contractor details
    const globalJobAdapter =
      typeof globalThis !== 'undefined' ? (globalThis as any).__solvebid_job_adapter : null;
    let proId = 'user-demo-pro';
    let proName = 'Assigned Professional';
    let probId: string | undefined = undefined;

    if (globalJobAdapter && typeof globalJobAdapter.getJobById === 'function') {
      try {
        const job = await globalJobAdapter.getJobById(cleanJobId);
        if (job) {
          proId = job.professionalId;
          proName = job.professionalName;
          probId = job.problemId;
        }
      } catch {
        // Fallback to defaults
      }
    }

    const newDispute: Dispute = {
      id: `DISP-${Math.floor(100 + Math.random() * 900)}`,
      jobId: payload.jobId.trim(),
      problemId: probId,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: 'customer@solvebid.demo',
      customerPhone: '+91 98765 43210',
      professionalId: proId,
      professionalName: proName,
      category: payload.category,
      title: payload.title.trim(),
      customerComplaint: payload.customerComplaint.trim(),
      status: 'OPEN',
      priority: 'HIGH',
      disputedAmount: payload.disputedAmount > 0 ? payload.disputedAmount : 1000,
      evidenceUrls: payload.evidenceUrls || [],
      history: [
        {
          id: `DH-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toISOString(),
          action: 'DISPUTE_FILED',
          actorRole: 'CUSTOMER',
          actorName: customer.name,
          notes: payload.customerComplaint.trim(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.disputes.unshift(newDispute);
    this.persistToStorage();

    // Transition job status to DISPUTED if job adapter is accessible
    if (globalJobAdapter && typeof globalJobAdapter.updateJobStatus === 'function') {
      try {
        await globalJobAdapter.updateJobStatus(
          payload.jobId.trim(),
          'DISPUTED',
          { id: customer.id, name: customer.name, role: 'CUSTOMER' },
          `Dispute filed: ${payload.title.trim()}`
        );
      } catch (err) {
        console.warn('Could not auto-transition job to DISPUTED:', err);
      }
    }

    // Add audit log entry
    const globalAdminAdapter =
      typeof globalThis !== 'undefined' ? (globalThis as any).__solvebid_admin_adapter : null;
    if (globalAdminAdapter && typeof globalAdminAdapter.addAuditLogEntry === 'function') {
      try {
        await globalAdminAdapter.addAuditLogEntry({
          adminId: customer.id,
          adminName: customer.name,
          action: 'OPEN_DISPUTE',
          entityType: 'DISPUTE_ARBITRATION',
          entityId: newDispute.id,
          previousState: 'IN_PROGRESS',
          newState: 'DISPUTED',
          reason: `Customer opened dispute on Job #${payload.jobId}: ${payload.title}`,
        });
      } catch (err) {
        console.warn('Could not log dispute creation to audit log:', err);
      }
    }

    return JSON.parse(JSON.stringify(newDispute));
  }

  public async resolveDispute(
    payload: ResolveDisputePayload,
    admin: { id: string; name: string }
  ): Promise<Dispute> {
    await delay();
    this.reloadFromStorage();

    const dispute = this.disputes.find(
      (d) => d.id.toUpperCase() === payload.disputeId.trim().toUpperCase()
    );
    if (!dispute) {
      throw new Error(`Dispute #${payload.disputeId} not found.`);
    }

    if (dispute.status === 'RESOLVED' || dispute.status === 'DISMISSED') {
      throw new Error(`Dispute #${dispute.id} has already been arbitrated (${dispute.status}). Duplicate resolution is prevented.`);
    }

    if (!payload.explanation || payload.explanation.trim().length < 10) {
      throw new Error('Please provide a formal arbitration explanation (at least 10 characters).');
    }

    const decisionRecord: ArbitrationDecision = {
      decision: payload.decision,
      explanation: payload.explanation.trim(),
      adminNotes: payload.adminNotes?.trim(),
      resolvedAt: new Date().toISOString(),
      arbitratorId: admin.id,
      arbitratorName: admin.name,
    };

    const previousStatus = dispute.status;
    const nextStatus: DisputeStatus = payload.decision === 'DISMISS' ? 'DISMISSED' : 'RESOLVED';

    dispute.status = nextStatus;
    dispute.arbitrationDecision = decisionRecord;
    dispute.updatedAt = new Date().toISOString();

    dispute.history.push({
      id: `DH-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      action: `ARBITRATION_${payload.decision}`,
      actorRole: 'ADMIN',
      actorName: admin.name,
      notes: payload.explanation.trim(),
    });

    this.persistToStorage();

    // Log to admin audit logs if mockAdminAdapter is registered
    const globalAdminAdapter =
      typeof globalThis !== 'undefined' ? (globalThis as any).__solvebid_admin_adapter : null;
    if (globalAdminAdapter && typeof globalAdminAdapter.addAuditLogEntry === 'function') {
      try {
        await globalAdminAdapter.addAuditLogEntry({
          adminId: admin.id,
          adminName: admin.name,
          action: `ARBITRATE_DISPUTE_${payload.decision}`,
          entityType: 'DISPUTE_ARBITRATION',
          entityId: dispute.id,
          previousState: previousStatus,
          newState: nextStatus,
          reason: payload.explanation.trim(),
        });
      } catch (err) {
        console.warn('Could not record dispute resolution in audit log:', err);
      }
    }

    return JSON.parse(JSON.stringify(dispute));
  }

  public async recordProfessionalResponse(
    disputeId: string,
    response: string,
    pro: { id: string; name: string }
  ): Promise<Dispute> {
    await delay();
    this.reloadFromStorage();

    const dispute = this.disputes.find(
      (d) => d.id.toUpperCase() === disputeId.trim().toUpperCase()
    );
    if (!dispute) {
      throw new Error(`Dispute #${disputeId} not found.`);
    }

    if (!response || response.trim().length < 10) {
      throw new Error('Response must contain at least 10 characters.');
    }

    dispute.professionalResponse = response.trim();
    if (dispute.status === 'OPEN') {
      dispute.status = 'UNDER_REVIEW';
    }
    dispute.updatedAt = new Date().toISOString();

    dispute.history.push({
      id: `DH-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      action: 'PROFESSIONAL_RESPONSE_FILED',
      actorRole: 'PROFESSIONAL',
      actorName: pro.name,
      notes: response.trim(),
    });

    this.persistToStorage();
    return JSON.parse(JSON.stringify(dispute));
  }

  public __resetToSeed(): void {
    // Non-browser (Node.js / unit testing) environment:
    // Only initialize from seed data if not yet populated in-memory.
    if (!this.disputes || this.disputes.length === 0) {
      this.disputes = JSON.parse(JSON.stringify(INITIAL_SEED_DISPUTES));
    }
  }

  public __injectDispute(dispute: Dispute): void {
    this.disputes.push(dispute);
    this.persistToStorage();
  }
}

export const mockDisputeAdapter = new MockDisputeAdapter();

if (typeof globalThis !== 'undefined') {
  (globalThis as any).__solvebid_dispute_adapter = mockDisputeAdapter;
}
