// [DEV-ONLY FIXTURE]: Client-side administrative governance & audit prototype simulation.
// Does NOT provide production security or backend persistence.

import type {
  PlatformMetrics,
  ProfessionalVerificationRecord,
  ServiceCategory,
  AdminAuditLogEntry,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '@/types/admin';
import type { IAdminService, VerificationFilterOptions, AuditLogFilterOptions } from './adminService';

const STORAGE_VERIFICATIONS_KEY = 'solvebid_mock_admin_verifications';
const STORAGE_CATEGORIES_KEY = 'solvebid_mock_admin_categories';
const STORAGE_AUDIT_LOGS_KEY = 'solvebid_mock_admin_audit_logs';

const SIMULATED_LATENCY_MS = typeof process !== 'undefined' && process.env.NODE_ENV === 'test' ? 0 : 200;

function delay(ms = SIMULATED_LATENCY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const INITIAL_SEED_VERIFICATIONS: ProfessionalVerificationRecord[] = [
  {
    id: 'VERIF-ECOCOOL',
    professionalId: 'pro-ecocool',
    professionalName: 'Vikram Deshmukh',
    businessName: 'EcoCool Services',
    email: 'ecocool.pune@solvebid.demo',
    phone: '+91 98765 43220',
    city: 'Pune',
    neighborhood: 'Hadapsar',
    category: 'Home Appliances & HVAC',
    skills: ['AC Compressor Diagnostics', 'Inverter PCB Repair', 'Gas Leak Detection'],
    experienceYears: 6,
    submittedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    status: 'PENDING_VERIFICATION',
    documents: [
      {
        id: 'DOC-01',
        type: 'TRADE_LICENSE',
        title: 'Maharashtra Electrical Wireman License',
        documentNumber: 'LIC-MH-2021-9921',
        issuedBy: 'Govt. of Maharashtra Energy Dept',
        validUntil: '2028-12-31',
        isVerified: false,
      },
      {
        id: 'DOC-02',
        type: 'TAX_GST',
        title: 'GST Business Registration',
        documentNumber: '27AAACH7821Q1ZV',
        issuedBy: 'GSTN India',
        isVerified: false,
      },
      {
        id: 'DOC-03',
        type: 'ID_PROOF',
        title: 'Government Aadhar Identity Proof',
        documentNumber: 'XXXX-XXXX-8921',
        issuedBy: 'UIDAI',
        isVerified: false,
      },
    ],
    history: [],
  },
  {
    id: 'VERIF-1024',
    professionalId: 'pro-rapid-plumb',
    professionalName: 'Rakesh Shinde',
    businessName: 'Pune Rapid Plumbing',
    email: 'rapid.plumbing@solvebid.demo',
    phone: '+91 98765 43231',
    city: 'Pune',
    neighborhood: 'Shivajinagar',
    category: 'Plumbing & Water Systems',
    skills: ['Pipe Joint Brazing', 'Pressure Testing', 'Concealed Leak Detection'],
    experienceYears: 5,
    submittedAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    status: 'PENDING_VERIFICATION',
    documents: [
      {
        id: 'DOC-04',
        type: 'TRADE_LICENSE',
        title: 'Pune Municipal Trade License',
        documentNumber: 'PMC-PLM-4402',
        issuedBy: 'PMC Health & Water Works',
        isVerified: false,
      },
      {
        id: 'DOC-05',
        type: 'ID_PROOF',
        title: 'Voter ID Proof',
        documentNumber: 'MH/04/182/0029',
        issuedBy: 'Election Commission of India',
        isVerified: false,
      },
    ],
    history: [],
  },
  {
    id: 'VERIF-1025',
    professionalId: 'pro-apex-elec',
    professionalName: 'Anand Joshi',
    businessName: 'Apex Electrical Solutions',
    email: 'apex.electrical@solvebid.demo',
    phone: '+91 98765 43242',
    city: 'Pune',
    neighborhood: 'Baner',
    category: 'Electrical Systems',
    skills: ['Three-Phase Panel Wiring', 'MCB Tripping Isolation', 'Industrial Earthing'],
    experienceYears: 8,
    submittedAt: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
    status: 'PENDING_VERIFICATION',
    documents: [
      {
        id: 'DOC-06',
        type: 'TRADE_LICENSE',
        title: 'Licensed Electrical Supervisor Certificate',
        documentNumber: 'MH-SUPV-EL-1092',
        issuedBy: 'Chief Electrical Inspectorate',
        isVerified: false,
      },
      {
        id: 'DOC-07',
        type: 'TAX_GST',
        title: 'GST Certificate',
        documentNumber: '27AALCJ9920K1ZX',
        isVerified: false,
      },
    ],
    history: [],
  },
  {
    id: 'VERIF-1026',
    professionalId: 'pro-coolbreeze',
    professionalName: 'Dinesh Rao',
    businessName: 'CoolBreeze Air Conditioning',
    email: 'coolbreeze.pune@solvebid.demo',
    phone: '+91 98765 43253',
    city: 'Pune',
    neighborhood: 'Viman Nagar',
    category: 'Home Appliances & HVAC',
    skills: ['Ductable AC Maintenance', 'VRV / VRF Diagnostics'],
    experienceYears: 4,
    submittedAt: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
    status: 'PENDING_VERIFICATION',
    documents: [
      {
        id: 'DOC-08',
        type: 'SKILL_CERTIFICATE',
        title: 'Carrier Certified Technician Credential',
        documentNumber: 'CARR-TECH-2022',
        isVerified: false,
      },
    ],
    history: [],
  },
  {
    id: 'VERIF-DEMO-PRO',
    professionalId: 'user-demo-pro',
    professionalName: 'Arun Kumar',
    businessName: 'Arun HVAC Services',
    email: 'pro.hvac@solvebid.demo',
    phone: '+91 98765 43211',
    city: 'Pune',
    neighborhood: 'Kothrud',
    category: 'Home Appliances & HVAC',
    skills: ['AC Gas Refill & Cooling', 'Compressor Diagnostics', 'Inverter PCB Repair'],
    experienceYears: 8,
    submittedAt: new Date(Date.now() - 120 * 24 * 3600 * 1000).toISOString(),
    status: 'VERIFIED',
    documents: [
      {
        id: 'DOC-09',
        type: 'TRADE_LICENSE',
        title: 'National Trade Certificate (RAC)',
        documentNumber: 'NCVT-RAC-0912',
        isVerified: true,
      },
    ],
    currentDecision: {
      action: 'APPROVE',
      reason: 'All trade licenses and GST registrations verified with NCVT database.',
      timestamp: new Date(Date.now() - 110 * 24 * 3600 * 1000).toISOString(),
      adminId: 'user-demo-admin',
      adminName: 'Chief Administrator',
    },
    history: [],
  },
];

export const INITIAL_SEED_CATEGORIES: ServiceCategory[] = [
  {
    id: 'CAT-HVAC',
    name: 'Home Appliances & HVAC',
    description: 'Air conditioners, refrigerators, water heaters, and washing machine diagnostic & repair services.',
    status: 'ACTIVE',
    tags: ['AC Not Cooling', 'Compressor Tripping', 'Water Heater Leaking', 'Gas Recharge', 'Inverter PCB'],
    requiredSkills: ['Refrigerant Handling', 'Electrical Safety Certificate', 'Capacitor Diagnostics'],
    referenceCount: 24,
    createdAt: new Date(Date.now() - 180 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'CAT-ELEC',
    name: 'Electrical Systems',
    description: 'Residential & commercial wiring, MCB switchboards, phase balancing, and inverter installation.',
    status: 'ACTIVE',
    tags: ['MCB Tripping', 'Concealed Wiring Fault', 'Earthing Test', 'Switchboard Sparking'],
    requiredSkills: ['Wireman License', 'High Voltage Safety', 'Three-Phase Isolation'],
    referenceCount: 18,
    createdAt: new Date(Date.now() - 180 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'CAT-PLUMB',
    name: 'Plumbing & Water Systems',
    description: 'Concealed pipe leakage, pressure testing, tap & sanitary fixtures, drainage cleaning, and booster pumps.',
    status: 'ACTIVE',
    tags: ['Pipe Leakage', 'Drain Blockage', 'Water Tank Overflow', 'Tap Valve Replacement'],
    requiredSkills: ['Pressure Testing', 'Pipe Brazing', 'Sanitary Rough-in'],
    referenceCount: 15,
    createdAt: new Date(Date.now() - 180 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'CAT-CARP',
    name: 'Carpentry & Furniture',
    description: 'Modular furniture assembly, door locks & hinges, wooden partition repairs, and custom cabinetry.',
    status: 'ACTIVE',
    tags: ['Door Hinge Sagging', 'Lock Jammed', 'Wardrobe Sliding Track', 'Bed Frame Repair'],
    requiredSkills: ['Woodworking Precision', 'Hardware Fitting'],
    referenceCount: 7,
    createdAt: new Date(Date.now() - 120 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'CAT-PAINT',
    name: 'Painting & Waterproofing',
    description: 'Terrace waterproofing, interior wall dampness treatments, texture finishes, and exterior weather coats.',
    status: 'ACTIVE',
    tags: ['Wall Seepage', 'Ceiling Dampness', 'Terrace Crack Sealing', 'Interior Paint'],
    requiredSkills: ['Moisture Meter Testing', 'Chemical Membrane Application'],
    referenceCount: 4,
    createdAt: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'CAT-CLEAN',
    name: 'Deep Cleaning & Sanitization',
    description: 'Post-construction cleanup, sofa shampooing, kitchen chimney degreasing, and bathroom descaling.',
    status: 'INACTIVE',
    tags: ['Chimney Grease', 'Bathroom Tiles Scaling', 'Sofa Deep Clean'],
    requiredSkills: ['Chemical Safety', 'Commercial Scrubbing Equipment'],
    referenceCount: 0,
    createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  },
];

export const INITIAL_SEED_AUDIT_LOGS: AdminAuditLogEntry[] = [
  {
    id: 'LOG-00101',
    adminId: 'user-demo-admin',
    adminName: 'Chief Administrator',
    action: 'SYSTEM_INITIALIZATION',
    entityType: 'SYSTEM_CONFIG',
    entityId: 'SYS-GLOBAL',
    timestamp: new Date(Date.now() - 180 * 24 * 3600 * 1000).toISOString(),
    previousState: 'UNINITIALIZED',
    newState: 'ACTIVE',
    reason: 'Initial SolveBid marketplace governance deployment.',
  },
  {
    id: 'LOG-00102',
    adminId: 'user-demo-admin',
    adminName: 'Chief Administrator',
    action: 'APPROVE_VERIFICATION',
    entityType: 'PROFESSIONAL_VERIFICATION',
    entityId: 'user-demo-pro',
    timestamp: new Date(Date.now() - 110 * 24 * 3600 * 1000).toISOString(),
    previousState: 'PENDING_VERIFICATION',
    newState: 'VERIFIED',
    reason: 'Verified National Trade Certificate (RAC) with NCVT database.',
  },
  {
    id: 'LOG-00103',
    adminId: 'user-demo-admin',
    adminName: 'Chief Administrator',
    action: 'CREATE_CATEGORY',
    entityType: 'CATEGORY_MANAGEMENT',
    entityId: 'CAT-PAINT',
    timestamp: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
    previousState: 'NONEXISTENT',
    newState: 'ACTIVE',
    reason: 'Added Painting & Waterproofing to taxonomy due to high monsoon demand.',
  },
  {
    id: 'LOG-00104',
    adminId: 'user-demo-admin',
    adminName: 'Chief Administrator',
    action: 'DEACTIVATE_CATEGORY',
    entityType: 'CATEGORY_MANAGEMENT',
    entityId: 'CAT-CLEAN',
    timestamp: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    previousState: 'ACTIVE',
    newState: 'INACTIVE',
    reason: 'Temporarily deactivated pending partner supplier onboardings.',
  },
];

export class MockAdminAdapter implements IAdminService {
  private verifications: ProfessionalVerificationRecord[] = [];
  private categories: ServiceCategory[] = [];
  private auditLogs: AdminAuditLogEntry[] = [];

  constructor() {
    this.reloadFromStorage();
  }

  private isStorageAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  private reloadFromStorage(): void {
    if (this.isStorageAvailable()) {
      try {
        const storedVerifs = window.localStorage.getItem(STORAGE_VERIFICATIONS_KEY);
        if (storedVerifs) this.verifications = JSON.parse(storedVerifs);
        else this.verifications = JSON.parse(JSON.stringify(INITIAL_SEED_VERIFICATIONS));

        const storedCats = window.localStorage.getItem(STORAGE_CATEGORIES_KEY);
        if (storedCats) this.categories = JSON.parse(storedCats);
        else this.categories = JSON.parse(JSON.stringify(INITIAL_SEED_CATEGORIES));

        const storedLogs = window.localStorage.getItem(STORAGE_AUDIT_LOGS_KEY);
        if (storedLogs) this.auditLogs = JSON.parse(storedLogs);
        else this.auditLogs = JSON.parse(JSON.stringify(INITIAL_SEED_AUDIT_LOGS));

        return;
      } catch (err) {
        console.warn('Failed to parse mock admin records from localStorage:', err);
      }
    }

    // Non-browser (Node.js / unit testing) environment:
    // Only initialize from seed data if not yet populated in-memory.
    if (!this.verifications || this.verifications.length === 0) {
      this.verifications = JSON.parse(JSON.stringify(INITIAL_SEED_VERIFICATIONS));
    }
    if (!this.categories || this.categories.length === 0) {
      this.categories = JSON.parse(JSON.stringify(INITIAL_SEED_CATEGORIES));
    }
    if (!this.auditLogs || this.auditLogs.length === 0) {
      this.auditLogs = JSON.parse(JSON.stringify(INITIAL_SEED_AUDIT_LOGS));
    }
  }

  private persistToStorage(): void {
    if (this.isStorageAvailable()) {
      try {
        window.localStorage.setItem(STORAGE_VERIFICATIONS_KEY, JSON.stringify(this.verifications));
        window.localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(this.categories));
        window.localStorage.setItem(STORAGE_AUDIT_LOGS_KEY, JSON.stringify(this.auditLogs));
      } catch (err) {
        console.warn('Failed to persist mock admin data to localStorage:', err);
      }
    }
  }

  public async getPlatformMetrics(): Promise<PlatformMetrics> {
    await delay(SIMULATED_LATENCY_MS > 0 ? 50 : 0);
    this.reloadFromStorage();

    const pendingCount = this.verifications.filter(
      (v) => v.status === 'PENDING_VERIFICATION' || v.status === 'UNVERIFIED' || v.status === 'REGISTERED'
    ).length;

    const verifiedCount = this.verifications.filter((v) => v.status === 'VERIFIED').length;

    return {
      totalCustomers: 1248,
      totalProfessionals: 320 + this.verifications.length,
      verifiedProfessionals: 320 + verifiedCount,
      pendingVerifications: pendingCount,
      activeProblems: 42,
      activeJobs: 18,
      openDisputes: 2,
      completedJobs: 856,
      simulatedRevenue: 428000,
    };
  }

  public async getVerificationQueue(
    filters?: VerificationFilterOptions
  ): Promise<ProfessionalVerificationRecord[]> {
    await delay();
    this.reloadFromStorage();

    return this.verifications.filter((v) => {
      if (filters?.status && filters.status !== 'ALL') {
        if (v.status !== filters.status) return false;
      }
      if (filters?.category) {
        if (v.category.toLowerCase() !== filters.category.toLowerCase()) return false;
      }
      if (filters?.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matches =
          v.professionalName.toLowerCase().includes(q) ||
          v.businessName.toLowerCase().includes(q) ||
          v.email.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q) ||
          v.skills.some((s) => s.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }

  public async getVerificationRecord(proId: string): Promise<ProfessionalVerificationRecord | null> {
    await delay(SIMULATED_LATENCY_MS > 0 ? 50 : 0);
    this.reloadFromStorage();

    const clean = proId.trim().toLowerCase();
    const found = this.verifications.find(
      (v) => v.professionalId.toLowerCase() === clean || v.id.toLowerCase() === clean
    );
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  public async approveVerification(
    proId: string,
    admin: { id: string; name: string }
  ): Promise<ProfessionalVerificationRecord> {
    await delay();
    this.reloadFromStorage();

    const clean = proId.trim().toLowerCase();
    const record = this.verifications.find(
      (v) => v.professionalId.toLowerCase() === clean || v.id.toLowerCase() === clean
    );
    if (!record) {
      throw new Error(`Verification application for "${proId}" not found.`);
    }

    if (record.status === 'VERIFIED') {
      throw new Error(`Professional "${record.professionalName}" is already verified.`);
    }

    const previousStatus = record.status;
    record.status = 'VERIFIED';
    record.documents.forEach((d) => (d.isVerified = true));

    const decision = {
      action: 'APPROVE' as const,
      reason: 'All submitted identity records and trade credentials verified.',
      timestamp: new Date().toISOString(),
      adminId: admin.id,
      adminName: admin.name,
    };
    record.currentDecision = decision;
    record.history.push(decision);

    this.persistToStorage();

    // Log audit entry
    await this.addAuditLogEntry({
      adminId: admin.id,
      adminName: admin.name,
      action: 'APPROVE_VERIFICATION',
      entityType: 'PROFESSIONAL_VERIFICATION',
      entityId: record.professionalId,
      previousState: previousStatus,
      newState: 'VERIFIED',
      reason: 'Credentials reviewed and approved.',
    });

    // Synchronize global matchingService profile verified attribute if available
    const globalMatching =
      typeof globalThis !== 'undefined' ? (globalThis as any).__solvebid_matching_service : null;
    if (globalMatching && typeof globalMatching.getProfessionalById === 'function') {
      try {
        const pro = await globalMatching.getProfessionalById(record.professionalId);
        if (pro) pro.verified = true;
      } catch (err) {
        console.warn('Could not sync verified status to matching service:', err);
      }
    }

    return JSON.parse(JSON.stringify(record));
  }

  public async rejectVerification(
    proId: string,
    reason: string,
    admin: { id: string; name: string }
  ): Promise<ProfessionalVerificationRecord> {
    await delay();
    this.reloadFromStorage();

    const clean = proId.trim().toLowerCase();
    const record = this.verifications.find(
      (v) => v.professionalId.toLowerCase() === clean || v.id.toLowerCase() === clean
    );
    if (!record) {
      throw new Error(`Verification application for "${proId}" not found.`);
    }

    if (!reason || reason.trim().length < 10) {
      throw new Error('Please provide a descriptive reason for rejection (at least 10 characters).');
    }

    const previousStatus = record.status;
    record.status = 'REJECTED';

    const decision = {
      action: 'REJECT' as const,
      reason: reason.trim(),
      timestamp: new Date().toISOString(),
      adminId: admin.id,
      adminName: admin.name,
    };
    record.currentDecision = decision;
    record.history.push(decision);

    this.persistToStorage();

    await this.addAuditLogEntry({
      adminId: admin.id,
      adminName: admin.name,
      action: 'REJECT_VERIFICATION',
      entityType: 'PROFESSIONAL_VERIFICATION',
      entityId: record.professionalId,
      previousState: previousStatus,
      newState: 'REJECTED',
      reason: reason.trim(),
    });

    return JSON.parse(JSON.stringify(record));
  }

  public async requestVerificationInfo(
    proId: string,
    notes: string,
    admin: { id: string; name: string }
  ): Promise<ProfessionalVerificationRecord> {
    await delay();
    this.reloadFromStorage();

    const clean = proId.trim().toLowerCase();
    const record = this.verifications.find(
      (v) => v.professionalId.toLowerCase() === clean || v.id.toLowerCase() === clean
    );
    if (!record) {
      throw new Error(`Verification application for "${proId}" not found.`);
    }

    if (!notes || notes.trim().length < 10) {
      throw new Error('Please specify what documentation or information is requested (at least 10 characters).');
    }

    const previousStatus = record.status;
    // Retains UNVERIFIED or sets PENDING_VERIFICATION (never grants verification)
    record.status = 'PENDING_VERIFICATION';

    const decision = {
      action: 'REQUEST_INFORMATION' as const,
      reason: notes.trim(),
      timestamp: new Date().toISOString(),
      adminId: admin.id,
      adminName: admin.name,
    };
    record.currentDecision = decision;
    record.history.push(decision);

    this.persistToStorage();

    await this.addAuditLogEntry({
      adminId: admin.id,
      adminName: admin.name,
      action: 'REQUEST_INFORMATION',
      entityType: 'PROFESSIONAL_VERIFICATION',
      entityId: record.professionalId,
      previousState: previousStatus,
      newState: 'PENDING_VERIFICATION',
      reason: notes.trim(),
    });

    return JSON.parse(JSON.stringify(record));
  }

  public async getCategories(): Promise<ServiceCategory[]> {
    await delay(SIMULATED_LATENCY_MS > 0 ? 50 : 0);
    this.reloadFromStorage();
    return JSON.parse(JSON.stringify(this.categories));
  }

  public async createCategory(
    payload: CreateCategoryPayload,
    admin: { id: string; name: string }
  ): Promise<ServiceCategory> {
    await delay();
    this.reloadFromStorage();

    const trimmedName = (payload.name || '').trim();
    if (!trimmedName || trimmedName.length < 3) {
      throw new Error('Category name must contain at least 3 characters.');
    }

    const isDuplicate = this.categories.some(
      (c) => c.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      throw new Error(`Category "${trimmedName}" already exists.`);
    }

    const newCat: ServiceCategory = {
      id: `CAT-${trimmedName.replace(/\s+/g, '-').toUpperCase().slice(0, 10)}`,
      name: trimmedName,
      description: (payload.description || '').trim(),
      status: payload.status || 'ACTIVE',
      tags: payload.tags || [],
      requiredSkills: payload.requiredSkills || [],
      referenceCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.categories.push(newCat);
    this.persistToStorage();

    await this.addAuditLogEntry({
      adminId: admin.id,
      adminName: admin.name,
      action: 'CREATE_CATEGORY',
      entityType: 'CATEGORY_MANAGEMENT',
      entityId: newCat.id,
      previousState: 'NONEXISTENT',
      newState: newCat.status,
      reason: `Created category "${newCat.name}" with ${newCat.tags.length} tags.`,
    });

    return JSON.parse(JSON.stringify(newCat));
  }

  public async updateCategory(
    id: string,
    payload: UpdateCategoryPayload,
    admin: { id: string; name: string }
  ): Promise<ServiceCategory> {
    await delay();
    this.reloadFromStorage();

    const cat = this.categories.find((c) => c.id === id);
    if (!cat) {
      throw new Error(`Category with ID "${id}" not found.`);
    }

    if (payload.name) {
      const trimmedName = payload.name.trim();
      const duplicate = this.categories.find(
        (c) => c.id !== id && c.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (duplicate) {
        throw new Error(`Another category named "${trimmedName}" already exists.`);
      }
      cat.name = trimmedName;
    }

    if (payload.description !== undefined) cat.description = payload.description.trim();
    if (payload.tags) cat.tags = payload.tags;
    if (payload.requiredSkills) cat.requiredSkills = payload.requiredSkills;
    if (payload.status) cat.status = payload.status;
    cat.updatedAt = new Date().toISOString();

    this.persistToStorage();

    await this.addAuditLogEntry({
      adminId: admin.id,
      adminName: admin.name,
      action: 'UPDATE_CATEGORY',
      entityType: 'CATEGORY_MANAGEMENT',
      entityId: cat.id,
      reason: `Updated category "${cat.name}".`,
    });

    return JSON.parse(JSON.stringify(cat));
  }

  public async toggleCategoryStatus(
    id: string,
    admin: { id: string; name: string }
  ): Promise<ServiceCategory> {
    await delay();
    this.reloadFromStorage();

    const cat = this.categories.find((c) => c.id === id);
    if (!cat) {
      throw new Error(`Category with ID "${id}" not found.`);
    }

    const previousStatus = cat.status;
    cat.status = cat.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    cat.updatedAt = new Date().toISOString();

    this.persistToStorage();

    await this.addAuditLogEntry({
      adminId: admin.id,
      adminName: admin.name,
      action: cat.status === 'ACTIVE' ? 'ACTIVATE_CATEGORY' : 'DEACTIVATE_CATEGORY',
      entityType: 'CATEGORY_MANAGEMENT',
      entityId: cat.id,
      previousState: previousStatus,
      newState: cat.status,
      reason: `Toggled category "${cat.name}" status to ${cat.status}.`,
    });

    return JSON.parse(JSON.stringify(cat));
  }

  public async deleteCategory(
    id: string,
    admin: { id: string; name: string }
  ): Promise<boolean> {
    await delay();
    this.reloadFromStorage();

    const cat = this.categories.find((c) => c.id === id);
    if (!cat) {
      throw new Error(`Category with ID "${id}" not found.`);
    }

    if (cat.referenceCount && cat.referenceCount > 0) {
      throw new Error(
        `Cannot delete category "${cat.name}": It is referenced by ${cat.referenceCount} active problem requests or registered professionals. Deactivate the category instead to preserve historical integrity.`
      );
    }

    this.categories = this.categories.filter((c) => c.id !== id);
    this.persistToStorage();

    await this.addAuditLogEntry({
      adminId: admin.id,
      adminName: admin.name,
      action: 'DELETE_CATEGORY',
      entityType: 'CATEGORY_MANAGEMENT',
      entityId: id,
      previousState: cat.name,
      newState: 'DELETED',
      reason: 'Deleted unreferenced service category.',
    });

    return true;
  }

  public async getAuditLogs(filters?: AuditLogFilterOptions): Promise<AdminAuditLogEntry[]> {
    await delay(SIMULATED_LATENCY_MS > 0 ? 50 : 0);
    this.reloadFromStorage();

    return this.auditLogs
      .filter((log) => {
        if (filters?.entityType && filters.entityType !== 'ALL') {
          if (log.entityType !== filters.entityType) return false;
        }
        if (filters?.action && filters.action !== 'ALL') {
          if (log.action !== filters.action) return false;
        }
        if (filters?.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          const matches =
            log.id.toLowerCase().includes(q) ||
            log.adminName.toLowerCase().includes(q) ||
            log.entityId.toLowerCase().includes(q) ||
            log.action.toLowerCase().includes(q) ||
            (log.reason && log.reason.toLowerCase().includes(q));
          if (!matches) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public async addAuditLogEntry(
    entry: Omit<AdminAuditLogEntry, 'id' | 'timestamp'>
  ): Promise<AdminAuditLogEntry> {
    const newEntry: AdminAuditLogEntry = {
      id: `LOG-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };

    this.auditLogs.unshift(newEntry);
    this.persistToStorage();
    return newEntry;
  }

  public __resetToSeed(): void {
    // Non-browser (Node.js / unit testing) environment:
    // Only initialize from seed data if not yet populated in-memory.
    if (!this.verifications || this.verifications.length === 0) {
      this.verifications = JSON.parse(JSON.stringify(INITIAL_SEED_VERIFICATIONS));
    }
    if (!this.categories || this.categories.length === 0) {
      this.categories = JSON.parse(JSON.stringify(INITIAL_SEED_CATEGORIES));
    }
    if (!this.auditLogs || this.auditLogs.length === 0) {
      this.auditLogs = JSON.parse(JSON.stringify(INITIAL_SEED_AUDIT_LOGS));
    }
  }

  public __injectVerification(v: ProfessionalVerificationRecord): void {
    this.verifications.push(v);
    this.persistToStorage();
  }
}

export const mockAdminAdapter = new MockAdminAdapter();

if (typeof globalThis !== 'undefined') {
  (globalThis as any).__solvebid_admin_adapter = mockAdminAdapter;
}
