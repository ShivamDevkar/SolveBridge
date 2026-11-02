// [DEV-ONLY FIXTURE]: Client-side prototype simulation. Does NOT provide production security or backend persistence.

import type { Problem, CreateProblemPayload, ProblemMetrics } from '@/types/problem';
import type { IProblemService, ProblemFilterOptions } from './problemService';

const STORAGE_PROBLEMS_KEY = 'solvebid_mock_problems';
const SIMULATED_LATENCY_MS = typeof process !== 'undefined' && process.env.NODE_ENV === 'test' ? 0 : 250;

function delay(ms = SIMULATED_LATENCY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const SEED_PROBLEMS: Problem[] = [
  {
    id: 'PB-00847',
    customerId: 'user-demo-customer',
    customerName: 'Sarthak Chavan',
    title: 'AC turns on but room is not cooling',
    description:
      'Split AC compressor runs for 5 minutes and then stops. Indoor unit blows ambient temperature air. Noticed unusual humming noise and small ice formation near the copper connection pipes on the outdoor condenser.',
    category: 'Home Appliances & HVAC',
    urgency: 'URGENT',
    location: {
      city: 'Pune',
      neighborhood: 'Kothrud',
      distanceKm: 3.2,
      maskedAddress: 'Near Karve Statue, Kothrud, Pune',
      fullAddress: 'Flat 402, Mayur Heights, Near Karve Statue, Kothrud, Pune 411038',
    },
    preferredDate: '2026-11-03',
    preferredTimeWindow: 'Morning (09:00 AM - 12:00 PM)',
    mediaUrls: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    ],
    status: 'PROPOSALS_RECEIVED',
    proposalsCount: 3,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'PB-00852',
    customerId: 'user-demo-customer',
    customerName: 'Sarthak Chavan',
    title: 'Washing machine front loader not draining water',
    description:
      'Front-load washing machine completes wash and spin cycles up to the final rinse, but fails to drain water and displays error code E20. Drum remains full and door is locked until manual drain hose is cleared.',
    category: 'Home Appliances & HVAC',
    urgency: 'SOON',
    location: {
      city: 'Pune',
      neighborhood: 'Baner',
      distanceKm: 5.8,
      maskedAddress: 'Near Pancard Club Road, Baner, Pune',
      fullAddress: 'Villa 12, Green Acres, Pancard Club Road, Baner, Pune 411045',
    },
    preferredDate: '2026-11-04',
    preferredTimeWindow: 'Afternoon (01:00 PM - 04:00 PM)',
    mediaUrls: [
      'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=600&q=80',
    ],
    status: 'OPEN',
    proposalsCount: 1,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'PB-00831',
    customerId: 'user-demo-customer',
    customerName: 'Sarthak Chavan',
    title: 'Main switchboard trips intermittently when water heater turns on',
    description:
      'Whenever the master bathroom geyser is turned on, the 32A MCB trips within 10 seconds. Noticed slight burning odor and sparks near the 16A wall socket switch.',
    category: 'Electrical Systems',
    urgency: 'URGENT',
    location: {
      city: 'Pune',
      neighborhood: 'Viman Nagar',
      distanceKm: 8.4,
      maskedAddress: 'Near Symbiosis Campus, Viman Nagar, Pune',
      fullAddress: 'Apt 104, Phoenix Nest, Viman Nagar, Pune 411014',
    },
    preferredDate: '2026-11-02',
    preferredTimeWindow: 'Evening (05:00 PM - 08:00 PM)',
    mediaUrls: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    ],
    status: 'PROFESSIONAL_SELECTED',
    proposalsCount: 2,
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
  },
  {
    id: 'PB-00790',
    customerId: 'user-demo-customer',
    customerName: 'Sarthak Chavan',
    title: 'Bathroom concealed pipe leakage under sink',
    description:
      'Water has been seeping through the grout lines behind the bathroom vanity. Wall on the opposite side in hallway is showing damp bubbles and moisture patches.',
    category: 'Plumbing & Water Systems',
    urgency: 'NORMAL',
    location: {
      city: 'Pune',
      neighborhood: 'Aundh',
      distanceKm: 6.1,
      maskedAddress: 'Near D-Mart, Aundh, Pune',
      fullAddress: 'B-601, Harmony Park, Aundh, Pune 411007',
    },
    preferredDate: '2026-10-25',
    preferredTimeWindow: 'Flexible',
    mediaUrls: [],
    status: 'CLOSED',
    proposalsCount: 3,
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  },
];

class MockProblemAdapter implements IProblemService {
  private inMemoryProblems: Map<string, Problem> = new Map();

  constructor() {
    this.initializeProblems();
  }

  private initializeProblems() {
    this.inMemoryProblems.clear();

    // Check if browser storage has active cached session problems
    let loadedFromStorage = false;
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(STORAGE_PROBLEMS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsed.forEach((p: Problem) => this.inMemoryProblems.set(p.id, p));
            loadedFromStorage = true;
          }
        }
      } catch {
        // Fall back to seed records if storage is corrupt
      }
    }

    if (!loadedFromStorage) {
      SEED_PROBLEMS.forEach((p) => this.inMemoryProblems.set(p.id, p));
    }
  }

  private syncStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const arr = Array.from(this.inMemoryProblems.values());
        window.localStorage.setItem(STORAGE_PROBLEMS_KEY, JSON.stringify(arr));
      } catch {
        // Storage full or disabled
      }
    }
  }

  async getProblems(customerId?: string, filters?: ProblemFilterOptions): Promise<Problem[]> {
    await delay();
    let list = Array.from(this.inMemoryProblems.values());

    if (customerId) {
      // In mock mode, if customerId matches demo customer or is supplied, return all matching or shared demo problems
      list = list.filter((p) => !p.customerId || p.customerId === customerId || customerId === 'user-demo-customer');
    }

    // Apply Status Filter
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((p) => p.status === filters.status);
    }

    // Apply Search Query Filter (title, description, neighborhood, or category)
    if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.location.neighborhood.toLowerCase().includes(q) ||
          p.location.city.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q)
      );
    }

    // Sort by createdAt descending
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return list;
  }

  async getProblemById(id: string): Promise<Problem | null> {
    await delay();
    const cleanId = id.trim().toUpperCase();
    const found = this.inMemoryProblems.get(cleanId);
    return found ? { ...found } : null;
  }

  async createProblem(
    payload: CreateProblemPayload,
    customerId: string,
    customerName: string
  ): Promise<Problem> {
    await delay();

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const id = `PB-${randomSuffix}${Math.floor(Math.random() * 90)}`;

    const maskedAddress = payload.landmark
      ? `Near ${payload.landmark}, ${payload.neighborhood}, ${payload.city}`
      : `${payload.neighborhood}, ${payload.city}`;

    const newProblem: Problem = {
      id,
      customerId: customerId || 'user-demo-customer',
      customerName: customerName || 'Customer User',
      title: payload.title.trim(),
      description: payload.description.trim(),
      category: payload.category && payload.category.trim() ? payload.category.trim() : 'General Diagnosis',
      urgency: payload.urgency,
      location: {
        city: payload.city,
        neighborhood: payload.neighborhood,
        maskedAddress,
        fullAddress: maskedAddress,
        distanceKm: Math.round((2 + Math.random() * 8) * 10) / 10,
      },
      budgetMin: payload.budgetMin,
      budgetMax: payload.budgetMax,
      preferredDate: payload.preferredDate,
      preferredTimeWindow: payload.preferredTimeWindow,
      mediaUrls: payload.mediaUrls || [],
      status: 'OPEN',
      proposalsCount: 0,
      createdAt: new Date().toISOString(),
    };

    this.inMemoryProblems.set(id, newProblem);
    this.syncStorage();

    return { ...newProblem };
  }

  async getProblemMetrics(customerId?: string): Promise<ProblemMetrics> {
    await delay();
    const all = await this.getProblems(customerId);

    const activeProblems = all.filter(
      (p) => p.status === 'OPEN' || p.status === 'PROPOSALS_RECEIVED'
    ).length;

    const incomingProposals = all.reduce(
      (acc, p) => (p.status === 'OPEN' || p.status === 'PROPOSALS_RECEIVED' ? acc + p.proposalsCount : acc),
      0
    );

    const jobsInProgress = all.filter((p) => p.status === 'PROFESSIONAL_SELECTED').length;
    const resolvedCount = all.filter((p) => p.status === 'CLOSED').length;

    return {
      activeProblems,
      incomingProposals,
      jobsInProgress,
      resolvedCount,
    };
  }

  async updateProblemStatus(problemId: string, status: Problem['status']): Promise<Problem | null> {
    await delay();
    const cleanId = problemId.trim().toUpperCase();
    const existing = this.inMemoryProblems.get(cleanId);
    if (!existing) return null;

    const updated: Problem = {
      ...existing,
      status,
    };
    this.inMemoryProblems.set(cleanId, updated);
    this.syncStorage();
    return { ...updated };
  }

  async incrementProposalCount(problemId: string): Promise<Problem | null> {
    await delay();
    const cleanId = problemId.trim().toUpperCase();
    const existing = this.inMemoryProblems.get(cleanId);
    if (!existing) return null;

    const updated: Problem = {
      ...existing,
      proposalsCount: (existing.proposalsCount || 0) + 1,
      status: existing.status === 'OPEN' ? 'PROPOSALS_RECEIVED' : existing.status,
    };
    this.inMemoryProblems.set(cleanId, updated);
    this.syncStorage();
    return { ...updated };
  }
}

export const mockProblemAdapter: IProblemService = new MockProblemAdapter();

if (typeof globalThis !== 'undefined') {
  (globalThis as any).__solvebid_problem_adapter = mockProblemAdapter;
}

