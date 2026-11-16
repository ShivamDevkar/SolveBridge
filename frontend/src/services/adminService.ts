import type {
  PlatformMetrics,
  ProfessionalVerificationRecord,
  ServiceCategory,
  AdminAuditLogEntry,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '@/types/admin';
import type { VerificationStatus } from '@/types/common';

export interface VerificationFilterOptions {
  status?: VerificationStatus | 'ALL';
  category?: string;
  searchQuery?: string;
}

export interface AuditLogFilterOptions {
  entityType?: string;
  action?: string;
  searchQuery?: string;
}

export interface IAdminService {
  /**
   * Returns aggregated marketplace health and activity metrics.
   */
  getPlatformMetrics(): Promise<PlatformMetrics>;

  /**
   * Retrieves professionals awaiting or undergoing credential validation.
   */
  getVerificationQueue(filters?: VerificationFilterOptions): Promise<ProfessionalVerificationRecord[]>;

  /**
   * Inspects detailed credential application for a professional.
   */
  getVerificationRecord(proId: string): Promise<ProfessionalVerificationRecord | null>;

  /**
   * Approves a professional's verification application, granting VERIFIED status.
   */
  approveVerification(
    proId: string,
    admin: { id: string; name: string }
  ): Promise<ProfessionalVerificationRecord>;

  /**
   * Rejects a professional's verification application with explicit reason.
   */
  rejectVerification(
    proId: string,
    reason: string,
    admin: { id: string; name: string }
  ): Promise<ProfessionalVerificationRecord>;

  /**
   * Requests further documentation from the applicant.
   */
  requestVerificationInfo(
    proId: string,
    notes: string,
    admin: { id: string; name: string }
  ): Promise<ProfessionalVerificationRecord>;

  /**
   * Retrieves all service categories and taxonomy items.
   */
  getCategories(): Promise<ServiceCategory[]>;

  /**
   * Creates a new service category.
   */
  createCategory(
    payload: CreateCategoryPayload,
    admin: { id: string; name: string }
  ): Promise<ServiceCategory>;

  /**
   * Updates existing category parameters.
   */
  updateCategory(
    id: string,
    payload: UpdateCategoryPayload,
    admin: { id: string; name: string }
  ): Promise<ServiceCategory>;

  /**
   * Activates or deactivates a category.
   */
  toggleCategoryStatus(
    id: string,
    admin: { id: string; name: string }
  ): Promise<ServiceCategory>;

  /**
   * Deletes an unreferenced category (blocks if referenced).
   */
  deleteCategory(
    id: string,
    admin: { id: string; name: string }
  ): Promise<boolean>;

  /**
   * Retrieves administrative audit trail logs.
   */
  getAuditLogs(filters?: AuditLogFilterOptions): Promise<AdminAuditLogEntry[]>;

  /**
   * Appends an administrative audit trail record.
   */
  addAuditLogEntry(
    entry: Omit<AdminAuditLogEntry, 'id' | 'timestamp'>
  ): Promise<AdminAuditLogEntry>;
}

