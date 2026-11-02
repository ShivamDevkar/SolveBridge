// [DEV-ONLY FIXTURE]: Client-side prototype simulation. Does NOT provide production security or backend persistence.

import type { Proposal } from '@/types/proposal';
import type { Job } from '@/types/job';
import type {
  IProposalService,
  SubmitProposalPayload,
  ProIdentitySummary,
  CustomerIdentitySummary,
  ProposalSelectionResult,
} from './proposalService';

function getMatchingService(): any {
  if (typeof globalThis !== 'undefined' && (globalThis as any).__solvebid_matching_service) {
    return (globalThis as any).__solvebid_matching_service;
  }
  return null;
}

function getProblemService(): any {
  if (typeof globalThis !== 'undefined' && (globalThis as any).__solvebid_problem_adapter) {
    return (globalThis as any).__solvebid_problem_adapter;
  }
  return null;
}

const STORAGE_PROPOSALS_KEY = 'solvebid_mock_proposals';
const STORAGE_JOBS_KEY = 'solvebid_mock_jobs';
const SIMULATED_LATENCY_MS = typeof process !== 'undefined' && process.env.NODE_ENV === 'test' ? 0 : 250;

function delay(ms = SIMULATED_LATENCY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const SEED_PROPOSALS: Proposal[] = [
  {
    id: 'PROP-00847-1',
    problemId: 'PB-00847',
    professionalId: 'user-demo-pro',
    professionalName: 'Arun Kumar',
    businessName: 'Arun HVAC Services',
    verified: true,
    averageRating: 4.85,
    completedJobsCount: 142,
    experienceYears: 8,
    estimatedPrice: 900,
    estimatedDuration: '1–2 hours',
    proposedVisitTime: 'Today, 4:30 PM',
    initialDiagnosis:
      'Examine condenser pressure with digital manifold, inspect dual-run capacitor for microfarad capacitance drop, clear drain tray, and top up R32 refrigerant if pressure is below 120 PSI.',
    includedServices: [
      'Diagnostic manifold gauge check',
      'Dual-run capacitor electrical test',
      'Condenser coil debris flush',
      'Drainage tray clearance',
    ],
    excludedServices: [
      'Major compressor motor replacement',
      'Refrigerant refill beyond 200 grams (charged at market rate if needed)',
    ],
    notes: 'Includes 30-day workmanship guarantee on capacitor and electrical terminal replacements.',
    matchScore: {
      overall: 94,
      skillMatch: 95,
      distanceMatch: 98,
      availabilityMatch: 95,
      ratingMatch: 97,
      responseSpeedMatch: 98,
    },
    status: 'SUBMITTED',
    validUntil: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
  {
    id: 'PROP-00847-2',
    problemId: 'PB-00847',
    professionalId: 'pro-coolpro',
    professionalName: 'Rajesh Sharma',
    businessName: 'CoolPro Climate Care',
    verified: true,
    averageRating: 4.92,
    completedJobsCount: 89,
    experienceYears: 6,
    estimatedPrice: 1150,
    estimatedDuration: '2–3 hours',
    proposedVisitTime: 'Tomorrow, 10:00 AM',
    initialDiagnosis:
      'Indoor jet chemical foam wash, electronic blower calibration, ultrasonic refrigerant sniffer leak test, and inlet/outlet temperature differential measurement.',
    includedServices: [
      'Electronic ultrasonic leak detection',
      'Inlet vs outlet thermal delta calculation',
      'Anti-fungal evaporator coil treatment',
      'Current draw amp measurement on compressor',
    ],
    excludedServices: ['PCB board micro-soldering or replacement'],
    notes: 'Comprehensive digital service report provided with before and after thermal photos.',
    matchScore: {
      overall: 91,
      skillMatch: 92,
      distanceMatch: 88,
      availabilityMatch: 95,
      ratingMatch: 98,
      responseSpeedMatch: 86,
    },
    status: 'SUBMITTED',
    validUntil: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
  },
  {
    id: 'PROP-00847-3',
    problemId: 'PB-00847',
    professionalId: 'pro-quickchill',
    professionalName: 'Suresh Nair',
    businessName: 'QuickChill Solutions',
    verified: true,
    averageRating: 4.65,
    completedJobsCount: 54,
    experienceYears: 5,
    estimatedPrice: 850,
    estimatedDuration: '1 hour',
    proposedVisitTime: 'Today, 6:00 PM',
    initialDiagnosis:
      'Visual electrical inspection, air filter cleaning, contactor relay check, and compressor running current check using digital clamp meter.',
    includedServices: [
      'Electrical clamp amperage test',
      'Primary air filter cleaning',
      'Drain pipe pressurized blowout',
    ],
    excludedServices: ['Chemical foam cleaning', 'Refrigerant top-up'],
    notes: 'Quick turnaround diagnostic visit with same-day availability.',
    matchScore: {
      overall: 86,
      skillMatch: 85,
      distanceMatch: 82,
      availabilityMatch: 95,
      ratingMatch: 93,
      responseSpeedMatch: 86,
    },
    status: 'SUBMITTED',
    validUntil: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
  {
    id: 'PROP-00852-1',
    problemId: 'PB-00852',
    professionalId: 'pro-quickchill',
    professionalName: 'Suresh Nair',
    businessName: 'QuickChill Solutions',
    verified: true,
    averageRating: 4.65,
    completedJobsCount: 54,
    experienceYears: 5,
    estimatedPrice: 650,
    estimatedDuration: '1 hour',
    proposedVisitTime: 'Tomorrow, 2:00 PM',
    initialDiagnosis:
      'Inspect coin trap filter for foreign object obstructions, test drain pump impeller rotation, and measure drain solenoid electrical resistance.',
    includedServices: [
      'Coin trap filter manual cleanout',
      'Corrugated drain hose backflush',
      'Impeller mechanical resistance check',
    ],
    excludedServices: ['Drain pump motor replacement unit'],
    notes: 'Clear diagnostic approach with no hidden fees.',
    matchScore: {
      overall: 89,
      skillMatch: 88,
      distanceMatch: 90,
      availabilityMatch: 95,
      ratingMatch: 93,
      responseSpeedMatch: 86,
    },
    status: 'SUBMITTED',
    validUntil: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    id: 'PROP-00831-1',
    problemId: 'PB-00831',
    professionalId: 'pro-precision-elec',
    professionalName: 'Mahesh Patil',
    businessName: 'Pune Precision Electricals',
    verified: true,
    averageRating: 4.95,
    completedJobsCount: 210,
    experienceYears: 11,
    estimatedPrice: 1200,
    estimatedDuration: '2 hours',
    proposedVisitTime: '2026-11-02, 5:30 PM',
    initialDiagnosis:
      'Megger insulation resistance test on geyser heating coil, inspect 16A wall switch contact carbonization, and calibrate 32A MCB thermal trip threshold.',
    includedServices: [
      'Megger 500V insulation resistance test',
      'Distribution board busbar screw re-torquing',
      'Earth loop impedance check',
      'Heavy-duty 16A ceramic switch replacement',
    ],
    excludedServices: ['Geyser inner copper tank replacement'],
    notes: 'Licensed wireman guarantee with full safety compliance inspection.',
    matchScore: {
      overall: 96,
      skillMatch: 98,
      distanceMatch: 94,
      availabilityMatch: 95,
      ratingMatch: 99,
      responseSpeedMatch: 98,
    },
    status: 'ACCEPTED',
    validUntil: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 70 * 3600 * 1000).toISOString(),
  },
];

export const SEED_JOBS: Job[] = [
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
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
];

class MockProposalAdapter implements IProposalService {
  private inMemoryProposals: Map<string, Proposal> = new Map();
  private inMemoryJobs: Map<string, Job> = new Map();

  constructor() {
    this.initialize();
  }

  private initialize() {
    this.inMemoryProposals.clear();
    this.inMemoryJobs.clear();

    let loadedProposals = false;
    let loadedJobs = false;

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const rawProposals = window.localStorage.getItem(STORAGE_PROPOSALS_KEY);
        if (rawProposals) {
          const parsed = JSON.parse(rawProposals);
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsed.forEach((p: Proposal) => this.inMemoryProposals.set(p.id, p));
            loadedProposals = true;
          }
        }
      } catch {
        // Fall back to seed
      }

      try {
        const rawJobs = window.localStorage.getItem(STORAGE_JOBS_KEY);
        if (rawJobs) {
          const parsed = JSON.parse(rawJobs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsed.forEach((j: Job) => this.inMemoryJobs.set(j.id, j));
            loadedJobs = true;
          }
        }
      } catch {
        // Fall back to seed
      }
    }

    if (!loadedProposals) {
      SEED_PROPOSALS.forEach((p) => this.inMemoryProposals.set(p.id, p));
    }
    if (!loadedJobs) {
      SEED_JOBS.forEach((j) => this.inMemoryJobs.set(j.id, j));
    }
  }

  private syncStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const proposalsArr = Array.from(this.inMemoryProposals.values());
        window.localStorage.setItem(STORAGE_PROPOSALS_KEY, JSON.stringify(proposalsArr));

        const jobsArr = Array.from(this.inMemoryJobs.values());
        window.localStorage.setItem(STORAGE_JOBS_KEY, JSON.stringify(jobsArr));
      } catch {
        // Storage disabled or full
      }
    }
  }

  async getProposalsForProblem(problemId: string): Promise<Proposal[]> {
    await delay();
    const cleanId = problemId.trim().toUpperCase();
    const results = Array.from(this.inMemoryProposals.values()).filter(
      (p) => p.problemId.toUpperCase() === cleanId
    );

    // Sort: ACCEPTED first, then by overall matchScore descending
    results.sort((a, b) => {
      if (a.status === 'ACCEPTED') return -1;
      if (b.status === 'ACCEPTED') return 1;
      return b.matchScore.overall - a.matchScore.overall;
    });

    return results;
  }

  async getProposalById(id: string): Promise<Proposal | null> {
    await delay();
    const cleanId = id.trim().toUpperCase();
    const found = this.inMemoryProposals.get(cleanId);
    return found ? { ...found } : null;
  }

  async getProposalsByProfessional(professionalId: string): Promise<Proposal[]> {
    await delay();
    const cleanProId = professionalId.trim().toLowerCase();
    const results = Array.from(this.inMemoryProposals.values()).filter(
      (p) => p.professionalId.toLowerCase() === cleanProId
    );
    // Sort latest first
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return results;
  }

  async hasProSubmitted(problemId: string, professionalId: string): Promise<boolean> {
    await delay();
    const cleanProblemId = problemId.trim().toUpperCase();
    const cleanProId = professionalId.trim().toLowerCase();

    return Array.from(this.inMemoryProposals.values()).some(
      (p) =>
        p.problemId.toUpperCase() === cleanProblemId &&
        p.professionalId.toLowerCase() === cleanProId
    );
  }

  async submitProposal(
    payload: SubmitProposalPayload,
    pro: ProIdentitySummary
  ): Promise<Proposal> {
    await delay();

    const cleanProblemId = payload.problemId.trim().toUpperCase();
    const cleanProId = pro.id.trim();

    // 1. Duplicate proposal prevention
    const alreadySubmitted = Array.from(this.inMemoryProposals.values()).some(
      (p) =>
        p.problemId.toUpperCase() === cleanProblemId &&
        p.professionalId.toLowerCase() === cleanProId.toLowerCase()
    );

    if (alreadySubmitted) {
      throw new Error(
        `Duplicate proposal prevented: You have already submitted a proposal for Problem #${cleanProblemId}.`
      );
    }

    // 2. Retrieve problem to calculate simulated match score and update counters
    const problemService = getProblemService();
    const matching = getMatchingService();

    const problem = problemService ? await problemService.getProblemById(cleanProblemId) : null;
    if (!problem && problemService) {
      throw new Error(`Problem #${cleanProblemId} not found.`);
    }

    const proProfile = matching ? await matching.getProfessionalById(cleanProId) : null;
    const distanceKm = problem?.location?.distanceKm || 3.5;

    const matchScore = (matching && proProfile && problem)
      ? matching.calculateMatchScore(problem, proProfile, distanceKm)
      : {
          overall: 88,
          skillMatch: 90,
          distanceMatch: 85,
          availabilityMatch: 90,
          ratingMatch: Math.round((pro.averageRating / 5) * 100),
          responseSpeedMatch: 85,
        };

    const newId = `PROP-${cleanProblemId.replace('PB-', '')}-${Math.floor(10 + Math.random() * 90)}`;

    const newProposal: Proposal = {
      id: newId,
      problemId: cleanProblemId,
      professionalId: cleanProId,
      professionalName: pro.name,
      businessName: pro.businessName || pro.name,
      verified: pro.verified,
      averageRating: pro.averageRating || 4.8,
      completedJobsCount: pro.completedJobsCount || 10,
      experienceYears: pro.experienceYears || 5,
      estimatedPrice: payload.estimatedPrice,
      estimatedDuration: payload.estimatedDuration,
      proposedVisitTime: payload.proposedVisitTime,
      initialDiagnosis: payload.initialDiagnosis,
      includedServices: payload.includedServices,
      excludedServices: payload.excludedServices,
      notes: payload.notes,
      matchScore,
      status: 'SUBMITTED',
      validUntil: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    this.inMemoryProposals.set(newId, newProposal);

    // Increment problem proposal counter and update status to PROPOSALS_RECEIVED if OPEN
    if (problemService?.incrementProposalCount) {
      await problemService.incrementProposalCount(cleanProblemId);
    }

    this.syncStorage();

    return { ...newProposal };
  }

  async selectProposal(
    problemId: string,
    proposalId: string,
    customer: CustomerIdentitySummary
  ): Promise<ProposalSelectionResult> {
    await delay();

    const cleanProblemId = problemId.trim().toUpperCase();
    const cleanProposalId = proposalId.trim().toUpperCase();

    const targetProposal = this.inMemoryProposals.get(cleanProposalId);
    if (!targetProposal) {
      throw new Error(`Proposal #${cleanProposalId} not found.`);
    }

    if (targetProposal.problemId.toUpperCase() !== cleanProblemId) {
      throw new Error(`Proposal #${cleanProposalId} does not belong to Problem #${cleanProblemId}.`);
    }

    // 1. Mark target proposal ACCEPTED and all other proposals for this problem NOT_SELECTED
    const updatedProposals: Proposal[] = [];

    for (const [id, prop] of this.inMemoryProposals.entries()) {
      if (prop.problemId.toUpperCase() === cleanProblemId) {
        if (id === cleanProposalId) {
          const acceptedProp: Proposal = { ...prop, status: 'ACCEPTED' };
          this.inMemoryProposals.set(id, acceptedProp);
          updatedProposals.push(acceptedProp);
        } else {
          const rejectedProp: Proposal = { ...prop, status: 'NOT_SELECTED' };
          this.inMemoryProposals.set(id, rejectedProp);
          updatedProposals.push(rejectedProp);
        }
      }
    }

    // 2. Update problem status to PROFESSIONAL_SELECTED
    const problemService = getProblemService();
    const problem = problemService ? await problemService.getProblemById(cleanProblemId) : null;
    if (problemService?.updateProblemStatus) {
      await problemService.updateProblemStatus(cleanProblemId, 'PROFESSIONAL_SELECTED');
    }

    // 3. Provision a simulated Job record
    const jobId = `JOB-${cleanProblemId.replace('PB-', '')}`;
    const newJob: Job = {
      id: jobId,
      problemId: cleanProblemId,
      proposalId: cleanProposalId,
      customerId: customer.id,
      customerName: customer.name,
      professionalId: targetProposal.professionalId,
      professionalName: targetProposal.businessName || targetProposal.professionalName,
      category: problem?.category || 'General Service',
      title: problem?.title || 'Service Request',
      scheduledAt: targetProposal.proposedVisitTime,
      status: 'SCHEDULED',
      originalAmount: targetProposal.estimatedPrice,
      currentAmount: targetProposal.estimatedPrice,
      exactServiceAddress:
        problem?.location.fullAddress ||
        problem?.location.maskedAddress ||
        'Service address provided in workspace',
      createdAt: new Date().toISOString(),
    };

    this.inMemoryJobs.set(jobId, newJob);
    this.syncStorage();

    const acceptedResult = this.inMemoryProposals.get(cleanProposalId)!;

    return {
      proposal: { ...acceptedResult },
      job: { ...newJob },
      allProblemProposals: updatedProposals,
    };
  }

  async getJobs(): Promise<Job[]> {
    await delay();
    return Array.from(this.inMemoryJobs.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getJobById(jobId: string): Promise<Job | null> {
    await delay();
    const cleanId = jobId.trim().toUpperCase();
    const found = this.inMemoryJobs.get(cleanId);
    return found ? { ...found } : null;
  }
}

export const mockProposalAdapter: IProposalService = new MockProposalAdapter();

if (typeof globalThis !== 'undefined') {
  (globalThis as any).__solvebid_proposal_adapter = mockProposalAdapter;
}
