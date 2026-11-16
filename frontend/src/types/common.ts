export type UserRole = 'CUSTOMER' | 'PROFESSIONAL' | 'ADMIN';

export type VerificationStatus =
  | 'UNVERIFIED'
  | 'REGISTERED'
  | 'PENDING_VERIFICATION'
  | 'VERIFIED'
  | 'SUSPENDED'
  | 'REJECTED';

export type UrgencyLevel = 'NORMAL' | 'SOON' | 'URGENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  verificationStatus?: VerificationStatus;
  phone?: string;
  city?: string;
  businessName?: string;
  category?: string;
  skills?: string[];
  coverageRadius?: string;
}
