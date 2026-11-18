// [DEV-ONLY FIXTURE]: Client-side job workspace prototype simulation.
// Does NOT provide production security or backend persistence.

import type { Job, JobLifecycleStatus, JobActivityEvent, JobCompletionDetails } from '@/types/job';
import type { IJobService, JobFilterOptions, JobActor } from './jobService';

const STORAGE_JOBS_KEY = 'solvebid_mock_jobs';
const STORAGE_ACTIVITIES_KEY = 'solvebid_mock_job_activities';
const SIMULATED_LATENCY_MS = typeof process !== 'undefined' && process.env.NODE_ENV === 'test' ? 0 : 200;

function delay(ms = SIMULATED_LATENCY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const INITIAL_SEED_JOBS: Job[] = [
  {
    id: 'JOB-00847',
    problemId: 'PB-00847',
    proposalId: 'PROP-00847-1',
    customerId: 'user-demo-customer',
    customerName: 'Sarthak Chavan',
    professionalId: 'user-demo-pro',
    professionalName: 'Arun HVAC Services (Arun Kumar)',
    category: 'Home Appliances & HVAC',
    title: 'AC turns on but room is not cooling',
    scheduledAt: 'Today, 4:30 PM',
    status: 'IN_PROGRESS',
    originalAmount: 900,
    currentAmount: 900,
    exactServiceAddress: 'Flat 402, Mayur Heights, Near Karve Statue, Kothrud, Pune 411038',
    durationEstimate: '1–2 hours',
    scheduleNotes: 'Agreed diagnostic visit. Capacitor check & manifold gauge test.',
    startedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'JOB-00831',
    problemId: 'PB-00831',
    proposalId: 'PROP-00831-1',
    customerId: 'user-demo-customer',
    customerName: 'Sarthak Chavan',
    professionalId: 'pro-precision-elec',
    professionalName: 'Pune Precision Electricals (Mahesh Patil)',
    category: 'Electrical Systems',
    title: 'Main switchboard trips intermittently when water heater turns on',
    scheduledAt: '2026-11-02, 5:30 PM',
    status: 'SCHEDULED',
    originalAmount: 1200,
    currentAmount: 1200,
    exactServiceAddress: 'Apt 104, Phoenix Nest, Near Symbiosis Campus, Viman Nagar, Pune 411014',
    durationEstimate: '2 hours',
    scheduleNotes: 'Evening slot confirmed. Customer requests call 15 mins prior to arrival.',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    id: 'JOB-00790',
    problemId: 'PB-00790',
    proposalId: 'PROP-00790-1',
    customerId: 'user-demo-customer',
    customerName: 'Sarthak Chavan',
    professionalId: 'pro-quickchill',
    professionalName: 'QuickChill Solutions (Suresh Nair)',
    category: 'Plumbing & Water Systems',
    title: 'Bathroom concealed pipe leakage under sink',
    scheduledAt: '2026-10-25, 11:00 AM',
    status: 'CUSTOMER_CONFIRMED',
    originalAmount: 650,
    currentAmount: 650,
    exactServiceAddress: 'B-601, Harmony Park, Near D-Mart, Aundh, Pune 411007',
    durationEstimate: '1 hour',
    startedAt: '2026-10-25T11:15:00Z',
    completedAt: '2026-10-25T12:45:00Z',
    customerConfirmedAt: '2026-10-25T13:10:00Z',
    completionDetails: {
      workDone: 'Replaced worn 32mm drain trap gasket and re-sealed copper supply pipe joint.',
      notes: 'Customer conducted water drainage test. Clean seal achieved.',
      completedAt: '2026-10-25T12:45:00Z',
      confirmedAt: '2026-10-25T13:10:00Z',
    },
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  },
];

export const INITIAL_SEED_ACTIVITIES: Record<string, JobActivityEvent[]> = {
  'JOB-00847': [
    {
      id: 'act-847-1',
      jobId: 'JOB-00847',
      title: 'Professional Selected',
      description: 'Customer selected Arun HVAC Services. Agreed solution quote: ₹900.',
      actorRole: 'CUSTOMER',
      actorName: 'Sarthak Chavan',
      status: 'SCHEDULED',
      timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
    {
      id: 'act-847-2',
      jobId: 'JOB-00847',
      title: 'Appointment Scheduled',
      description: 'Visit confirmed for Today, 4:30 PM with estimated duration 1–2 hours.',
      actorRole: 'SYSTEM',
      actorName: 'SolveBid Workflow Engine',
      status: 'SCHEDULED',
      timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    },
    {
      id: 'act-847-3',
      jobId: 'JOB-00847',
      title: 'Contractor On The Way',
      description: 'Arun Kumar has departed and is en route to Kothrud.',
      actorRole: 'PROFESSIONAL',
      actorName: 'Arun Kumar',
      status: 'ON_THE_WAY',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'act-847-4',
      jobId: 'JOB-00847',
      title: 'Contractor Arrived on Site',
      description: 'Arun Kumar checked in at Flat 402, Mayur Heights.',
      actorRole: 'PROFESSIONAL',
      actorName: 'Arun Kumar',
      status: 'ARRIVED',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
    {
      id: 'act-847-5',
      jobId: 'JOB-00847',
      title: 'Work Started / In Progress',
      description: 'Diagnostic inspection started. Examining outdoor unit capacitor microfarad reading.',
      actorRole: 'PROFESSIONAL',
      actorName: 'Arun Kumar',
      status: 'IN_PROGRESS',
      timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    },
  ],
  'JOB-00831': [
    {
      id: 'act-831-1',
      jobId: 'JOB-00831',
      title: 'Professional Selected & Scheduled',
      description: 'Customer confirmed Mahesh Patil (Pune Precision Electricals) for geyser MCB trip diagnosis.',
      actorRole: 'CUSTOMER',
      actorName: 'Sarthak Chavan',
      status: 'SCHEDULED',
      timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    },
  ],
};

const PERMITTED_TRANSITIONS: Record<JobLifecycleStatus, JobLifecycleStatus[]> = {
  POSTED: ['SCHEDULED', 'CANCELLED'],
  SCHEDULED: ['ON_THE_WAY', 'IN_PROGRESS', 'CANCELLED', 'DISPUTED'],
  ON_THE_WAY: ['ARRIVED', 'IN_PROGRESS', 'CANCELLED', 'DISPUTED'],
  ARRIVED: ['INSPECTION', 'IN_PROGRESS', 'CANCELLED', 'DISPUTED'],
  INSPECTION: ['IN_PROGRESS', 'CANCELLED', 'DISPUTED'],
  IN_PROGRESS: ['COMPLETED', 'DISPUTED'],
  COMPLETED: ['CUSTOMER_CONFIRMED', 'DISPUTED'],
  CUSTOMER_CONFIRMED: ['CLOSED', 'REVIEW_PENDING', 'DISPUTED'],
  REVIEW_PENDING: ['CLOSED', 'DISPUTED'],
  CLOSED: [],
  CANCELLED: [],
  DISPUTED: ['IN_PROGRESS', 'REFUNDED', 'CLOSED'],
  REFUNDED: ['CLOSED'],
};

class MockJobAdapter implements IJobService {
  private inMemoryJobs: Map<string, Job> = new Map();
  private inMemoryActivities: Map<string, JobActivityEvent[]> = new Map();

  constructor() {
    this.initialize();
  }

  private initialize() {
    this.inMemoryJobs.clear();
    this.inMemoryActivities.clear();

    let loadedJobs = false;
    let loadedActivities = false;

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const rawJobs = window.localStorage.getItem(STORAGE_JOBS_KEY);
        if (rawJobs) {
          const parsed = JSON.parse(rawJobs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsed.forEach((j: Job) => this.inMemoryJobs.set(j.id.toUpperCase(), j));
            loadedJobs = true;
          }
        }
      } catch {
        // Fall back to seed
      }

      try {
        const rawActs = window.localStorage.getItem(STORAGE_ACTIVITIES_KEY);
        if (rawActs) {
          const parsed = JSON.parse(rawActs);
          if (parsed && typeof parsed === 'object') {
            for (const [jobId, list] of Object.entries(parsed)) {
              if (Array.isArray(list)) {
                this.inMemoryActivities.set(jobId.toUpperCase(), list);
              }
            }
            loadedActivities = true;
          }
        }
      } catch {
        // Fall back to seed
      }
    }

    if (!loadedJobs) {
      INITIAL_SEED_JOBS.forEach((j) => this.inMemoryJobs.set(j.id.toUpperCase(), { ...j }));
    }

    if (!loadedActivities) {
      for (const [jobId, list] of Object.entries(INITIAL_SEED_ACTIVITIES)) {
        this.inMemoryActivities.set(jobId.toUpperCase(), [...list]);
      }
    }
  }

  private syncStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const jobsArr = Array.from(this.inMemoryJobs.values());
        window.localStorage.setItem(STORAGE_JOBS_KEY, JSON.stringify(jobsArr));

        const actsObj: Record<string, JobActivityEvent[]> = {};
        for (const [k, v] of this.inMemoryActivities.entries()) {
          actsObj[k] = v;
        }
        window.localStorage.setItem(STORAGE_ACTIVITIES_KEY, JSON.stringify(actsObj));
      } catch {
        // Storage disabled or full
      }
    }
  }

  private reloadFromStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const rawJobs = window.localStorage.getItem(STORAGE_JOBS_KEY);
        if (rawJobs) {
          const parsed = JSON.parse(rawJobs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsed.forEach((j: Job) => this.inMemoryJobs.set(j.id.toUpperCase(), j));
          }
        }
      } catch {}

      try {
        const rawActs = window.localStorage.getItem(STORAGE_ACTIVITIES_KEY);
        if (rawActs) {
          const parsed = JSON.parse(rawActs);
          if (parsed && typeof parsed === 'object') {
            for (const [jobId, list] of Object.entries(parsed)) {
              if (Array.isArray(list)) {
                this.inMemoryActivities.set(jobId.toUpperCase(), list as JobActivityEvent[]);
              }
            }
          }
        }
      } catch {}
    }
  }

  setJob(job: Job) {
    this.inMemoryJobs.set(job.id.toUpperCase(), job);
    this.syncStorage();
  }

  async getJobs(filters?: JobFilterOptions): Promise<Job[]> {
    await delay();
    this.reloadFromStorage();
    let list = Array.from(this.inMemoryJobs.values());

    if (filters?.role === 'CUSTOMER' && filters.userId) {
      list = list.filter((j) => j.customerId === filters.userId || filters.userId === 'user-demo-customer');
    } else if (filters?.role === 'PROFESSIONAL' && filters.userId) {
      list = list.filter(
        (j) => j.professionalId.toLowerCase() === filters.userId?.toLowerCase() || filters.userId === 'user-demo-pro'
      );
    }

    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((j) => j.status === filters.status);
    }

    if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.trim().toLowerCase();
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.id.toLowerCase().includes(q) ||
          j.category.toLowerCase().includes(q) ||
          j.professionalName.toLowerCase().includes(q)
      );
    }

    // Sort descending by created date
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }

  async getJobById(jobId: string): Promise<Job | null> {
    await delay();
    this.reloadFromStorage();
    const cleanId = jobId.trim().toUpperCase();
    const found = this.inMemoryJobs.get(cleanId);
    return found ? { ...found } : null;
  }

  async updateJobStatus(
    jobId: string,
    nextStatus: JobLifecycleStatus,
    actor: JobActor,
    reason?: string
  ): Promise<Job> {
    await delay();
    const cleanId = jobId.trim().toUpperCase();
    const existing = this.inMemoryJobs.get(cleanId);
    if (!existing) {
      throw new Error(`Job #${cleanId} not found.`);
    }

    // Role-based action permissions check
    if (nextStatus === 'CUSTOMER_CONFIRMED' && actor.role !== 'CUSTOMER' && actor.role !== 'ADMIN') {
      throw new Error('Only the customer can confirm job completion.');
    }

    if (
      (nextStatus === 'ON_THE_WAY' ||
        nextStatus === 'ARRIVED' ||
        nextStatus === 'IN_PROGRESS' ||
        nextStatus === 'COMPLETED') &&
      actor.role !== 'PROFESSIONAL' &&
      actor.role !== 'ADMIN'
    ) {
      throw new Error('Only the assigned professional can perform operational status transitions.');
    }

    // Validate transition
    const permitted = PERMITTED_TRANSITIONS[existing.status] || [];
    if (!permitted.includes(nextStatus)) {
      throw new Error(
        `Invalid status transition: Cannot transition Job #${cleanId} from ${existing.status} to ${nextStatus}.`
      );
    }

    const now = new Date().toISOString();
    const updated: Job = {
      ...existing,
      status: nextStatus,
    };

    if (nextStatus === 'IN_PROGRESS' && !updated.startedAt) {
      updated.startedAt = now;
    } else if (nextStatus === 'COMPLETED') {
      updated.completedAt = now;
    } else if (nextStatus === 'CUSTOMER_CONFIRMED') {
      updated.customerConfirmedAt = now;
    } else if (nextStatus === 'CLOSED') {
      updated.closedAt = now;
    }

    this.inMemoryJobs.set(cleanId, updated);

    // Record activity event
    const statusTitles: Record<JobLifecycleStatus, string> = {
      POSTED: 'Job Created',
      SCHEDULED: 'Appointment Scheduled',
      ON_THE_WAY: 'Contractor On The Way',
      ARRIVED: 'Contractor Arrived',
      INSPECTION: 'Inspection in Progress',
      IN_PROGRESS: 'Work Started / In Progress',
      COMPLETED: 'Completion Requested by Professional',
      CUSTOMER_CONFIRMED: 'Completion Confirmed by Customer',
      REVIEW_PENDING: 'Review Pending',
      CLOSED: 'Job Closed',
      CANCELLED: 'Job Cancelled',
      DISPUTED: 'Dispute Raised',
      REFUNDED: 'Job Refunded',
    };

    const newActivity: JobActivityEvent = {
      id: `act-${cleanId}-${Date.now()}`,
      jobId: cleanId,
      title: statusTitles[nextStatus] || `Status Updated to ${nextStatus}`,
      description: reason || `${actor.name} (${actor.role}) updated job status to ${nextStatus}.`,
      actorRole: actor.role,
      actorName: actor.name,
      status: nextStatus,
      timestamp: now,
    };

    const existingActivities = this.inMemoryActivities.get(cleanId) || [];
    this.inMemoryActivities.set(cleanId, [...existingActivities, newActivity]);

    this.syncStorage();
    return { ...updated };
  }

  async updateJobSchedule(
    jobId: string,
    newScheduledAt: string,
    actor: JobActor,
    note?: string
  ): Promise<Job> {
    await delay();
    const cleanId = jobId.trim().toUpperCase();
    const existing = this.inMemoryJobs.get(cleanId);
    if (!existing) {
      throw new Error(`Job #${cleanId} not found.`);
    }

    if (!newScheduledAt || !newScheduledAt.trim()) {
      throw new Error('Appointment time cannot be empty.');
    }

    const updated: Job = {
      ...existing,
      scheduledAt: newScheduledAt.trim(),
      scheduleNotes: note?.trim() || existing.scheduleNotes,
    };

    this.inMemoryJobs.set(cleanId, updated);

    const now = new Date().toISOString();
    const newActivity: JobActivityEvent = {
      id: `act-${cleanId}-${Date.now()}`,
      jobId: cleanId,
      title: 'Appointment Time Updated',
      description: `${actor.name} updated the scheduled arrival time to: "${newScheduledAt.trim()}".${
        note ? ` Note: ${note.trim()}` : ''
      }`,
      actorRole: actor.role,
      actorName: actor.name,
      timestamp: now,
    };

    const existingActivities = this.inMemoryActivities.get(cleanId) || [];
    this.inMemoryActivities.set(cleanId, [...existingActivities, newActivity]);

    this.syncStorage();
    return { ...updated };
  }

  async addProgressUpdate(
    jobId: string,
    note: string,
    actor: JobActor
  ): Promise<JobActivityEvent> {
    await delay();
    const cleanId = jobId.trim().toUpperCase();
    const existing = this.inMemoryJobs.get(cleanId);
    if (!existing) {
      throw new Error(`Job #${cleanId} not found.`);
    }

    if (!note || note.trim().length < 5) {
      throw new Error('Progress update note must be at least 5 characters.');
    }

    const now = new Date().toISOString();
    const newActivity: JobActivityEvent = {
      id: `act-${cleanId}-${Date.now()}`,
      jobId: cleanId,
      title: 'Operational Progress Update',
      description: note.trim(),
      actorRole: actor.role,
      actorName: actor.name,
      status: existing.status,
      timestamp: now,
    };

    const existingActivities = this.inMemoryActivities.get(cleanId) || [];
    this.inMemoryActivities.set(cleanId, [...existingActivities, newActivity]);

    this.syncStorage();
    return newActivity;
  }

  async requestJobCompletion(
    jobId: string,
    summary: { workDone: string; notes?: string },
    actor: JobActor
  ): Promise<Job> {
    await delay();
    const cleanId = jobId.trim().toUpperCase();
    const existing = this.inMemoryJobs.get(cleanId);
    if (!existing) {
      throw new Error(`Job #${cleanId} not found.`);
    }

    if (actor.role !== 'PROFESSIONAL' && actor.role !== 'ADMIN') {
      throw new Error('Only the assigned professional can submit a completion request.');
    }

    if (!summary.workDone || summary.workDone.trim().length < 10) {
      throw new Error('Please provide a descriptive work completion summary (at least 10 characters).');
    }

    const now = new Date().toISOString();
    const completionDetails: JobCompletionDetails = {
      workDone: summary.workDone.trim(),
      notes: summary.notes?.trim(),
      completedAt: now,
    };

    const updated: Job = {
      ...existing,
      status: 'COMPLETED',
      completedAt: now,
      completionDetails,
    };

    this.inMemoryJobs.set(cleanId, updated);

    const newActivity: JobActivityEvent = {
      id: `act-${cleanId}-${Date.now()}`,
      jobId: cleanId,
      title: 'Completion Requested by Professional',
      description: `Work finished: "${summary.workDone.trim()}". Awaiting customer verification and sign-off.`,
      actorRole: actor.role,
      actorName: actor.name,
      status: 'COMPLETED',
      timestamp: now,
    };

    const existingActivities = this.inMemoryActivities.get(cleanId) || [];
    this.inMemoryActivities.set(cleanId, [...existingActivities, newActivity]);

    this.syncStorage();
    return { ...updated };
  }

  async confirmJobCompletion(
    jobId: string,
    actor: JobActor,
    feedbackNote?: string
  ): Promise<Job> {
    await delay();
    const cleanId = jobId.trim().toUpperCase();
    const existing = this.inMemoryJobs.get(cleanId);
    if (!existing) {
      throw new Error(`Job #${cleanId} not found.`);
    }

    if (actor.role !== 'CUSTOMER' && actor.role !== 'ADMIN') {
      throw new Error('Only the customer can confirm completion.');
    }

    if (existing.status !== 'COMPLETED') {
      throw new Error(`Cannot confirm completion when job status is ${existing.status}. Professional must submit completion first.`);
    }

    const now = new Date().toISOString();
    const updated: Job = {
      ...existing,
      status: 'CUSTOMER_CONFIRMED',
      customerConfirmedAt: now,
      completionDetails: existing.completionDetails
        ? {
            ...existing.completionDetails,
            confirmedAt: now,
          }
        : undefined,
    };

    this.inMemoryJobs.set(cleanId, updated);

    const newActivity: JobActivityEvent = {
      id: `act-${cleanId}-${Date.now()}`,
      jobId: cleanId,
      title: 'Customer Completion Confirmation',
      description: `Customer ${actor.name} verified service satisfaction and signed off on work completion.${
        feedbackNote ? ` Note: "${feedbackNote.trim()}"` : ''
      }`,
      actorRole: actor.role,
      actorName: actor.name,
      status: 'CUSTOMER_CONFIRMED',
      timestamp: now,
    };

    const existingActivities = this.inMemoryActivities.get(cleanId) || [];
    this.inMemoryActivities.set(cleanId, [...existingActivities, newActivity]);

    this.syncStorage();
    return { ...updated };
  }

  async closeJob(jobId: string, actor: JobActor): Promise<Job> {
    await delay();
    const cleanId = jobId.trim().toUpperCase();
    const existing = this.inMemoryJobs.get(cleanId);
    if (!existing) {
      throw new Error(`Job #${cleanId} not found.`);
    }
    if (existing.status !== 'CUSTOMER_CONFIRMED') {
      throw new Error('Customer confirmation is required before closing the job.');
    }
    if (actor.role !== 'CUSTOMER' && actor.role !== 'PROFESSIONAL' && actor.role !== 'ADMIN') {
      throw new Error('Only a job participant can close the job.');
    }

    const now = new Date().toISOString();
    const updated: Job = { ...existing, status: 'CLOSED', closedAt: now };
    this.inMemoryJobs.set(cleanId, updated);
    this.syncStorage();
    return { ...updated };
  }

  async getJobActivities(jobId: string): Promise<JobActivityEvent[]> {
    await delay();
    const cleanId = jobId.trim().toUpperCase();
    const activities = this.inMemoryActivities.get(cleanId) || [];
    // Sort descending by timestamp (newest first)
    return [...activities].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

export const mockJobAdapter: IJobService = new MockJobAdapter();

if (typeof globalThis !== 'undefined') {
  (globalThis as any).__solvebid_job_adapter = mockJobAdapter;
}
