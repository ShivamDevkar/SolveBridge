import type { VerificationStatus } from './common';

export interface PlatformMetrics {
  totalCustomers: number;
  totalProfessionals: number;
  verifiedProfessionals: number;
  pendingVerifications: number;
  activeProblems: number;
  activeJobs: number;
  openDisputes: number;
  completedJobs: number;
  simulatedRevenue: number; // In ₹, clearly identified as simulated development metric
}

export interface VerificationDocument {
  id: string;
  type: 'ID_PROOF' | 'TRADE_LICENSE' | 'TAX_GST' | 'SKILL_CERTIFICATE' | 'POLICE_CLEARANCE';
  title: string;
  documentNumber: string;
  issuedBy?: string;
  validUntil?: string;
  fileUrl?: string;
  isVerified?: boolean;
}

export interface VerificationDecisionLog {
  action: 'APPROVE' | 'REJECT' | 'REQUEST_INFORMATION';
  reason?: string;
  timestamp: string;
  adminId: string;
  adminName: string;
}

export interface ProfessionalVerificationRecord {
  id: string; // e.g. VERIF-1024 or PRO-xxxx
  professionalId: string;
  professionalName: string;
  businessName: string;
  email: string;
  phone: string;
  city: string;
  neighborhood: string;
  category: string;
  skills: string[];
  experienceYears: number;
  submittedAt: string;
  status: VerificationStatus;
  documents: VerificationDocument[];
  currentDecision?: VerificationDecisionLog;
  history: VerificationDecisionLog[];
}

export interface ServiceCategory {
  id: string; // e.g. CAT-HVAC
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  tags: string[];
  requiredSkills: string[];
  referenceCount?: number; // How many jobs/problems use this category
  createdAt: string;
  updatedAt: string;
}

export type AuditEntityType =
  | 'PROFESSIONAL_VERIFICATION'
  | 'DISPUTE_ARBITRATION'
  | 'CATEGORY_MANAGEMENT'
  | 'JOB_OVERRIDE'
  | 'USER_MODERATION'
  | 'SYSTEM_CONFIG';

export interface AdminAuditLogEntry {
  id: string; // e.g. LOG-00142
  adminId: string;
  adminName: string;
  action: string; // e.g. APPROVE_VERIFICATION, REJECT_VERIFICATION, RESOLVE_DISPUTE
  entityType: AuditEntityType;
  entityId: string;
  timestamp: string;
  previousState?: string;
  newState?: string;
  reason?: string;
}

export interface CreateCategoryPayload {
  name: string;
  description: string;
  tags: string[];
  requiredSkills: string[];
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateCategoryPayload {
  name?: string;
  description?: string;
  tags?: string[];
  requiredSkills?: string[];
  status?: 'ACTIVE' | 'INACTIVE';
}

