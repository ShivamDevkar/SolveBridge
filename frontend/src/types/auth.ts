// [DEV-ONLY FIXTURE]: Client-side prototype simulation. Does NOT provide production security or backend authorization.

import { User, UserRole, VerificationStatus } from './common';

/**
 * Storage persistence preference for client session.
 * - 'local': Preserved across browser sessions via localStorage.
 * - 'session': Preserved only for current browser tab via sessionStorage.
 */
export type SessionPersistence = 'local' | 'session';

/**
 * Non-sensitive session data persisted to browser storage.
 * NOTE: Plaintext passwords, password hashes, and credential secrets must NEVER be stored here.
 */
export interface StoredSessionData {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  verificationStatus?: VerificationStatus;
  phone?: string;
  city?: string;
  businessName?: string;
  category?: string;
  skills?: string[];
  coverageRadius?: string;
  mockToken: string; // Clearly identified development-only mock bearer token
  createdAt: string; // ISO 8601 string
}

/**
 * Form credentials for login operations.
 */
export interface LoginCredentials {
  email: string;
  password: string;
  role?: UserRole;
  rememberMe?: boolean;
}

/**
 * Customer registration payload.
 */
export interface CustomerRegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  city: string;
}

/**
 * Professional registration payload.
 */
export interface ProfessionalRegisterPayload {
  businessName: string;
  email: string;
  phone: string;
  password: string;
  category: string;
  skills: string[];
  coverageRadius: string; // e.g. "5", "10", "15", "25" km
}

/**
 * Password reset request payload.
 */
export interface PasswordResetRequestPayload {
  email: string;
}

/**
 * Result returned upon requesting a simulated password reset.
 */
export interface PasswordResetRequestResult {
  success: boolean;
  message: string;
  mockResetToken?: string; // Transient simulated token for local testing/handoff only
}

/**
 * Password reset execution payload.
 */
export interface PasswordResetPayload {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Result returned upon validating a simulated password reset token.
 */
export interface ValidateResetTokenResult {
  valid: boolean;
  email?: string;
  error?: string;
}

/**
 * Result returned upon executing a password reset.
 */
export interface PasswordResetResult {
  success: boolean;
  message: string;
}

/**
 * Result returned upon successful authentication.
 */
export interface AuthResult {
  success: true;
  user: User;
  mockToken: string;
  sessionData: StoredSessionData;
}

/**
 * Structured error returned upon failed authentication.
 */
export interface AuthError {
  success: false;
  message: string;
  code?: 'INVALID_CREDENTIALS' | 'USER_EXISTS' | 'INVALID_TOKEN' | 'UNAUTHORIZED' | 'VALIDATION_ERROR' | 'UNKNOWN';
  fieldErrors?: Record<string, string>;
}

/**
 * Profile update payload for authenticated users.
 * Role, email, and verification status are strictly excluded and immutable.
 */
export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  city?: string;
  businessName?: string;
  category?: string;
  skills?: string[];
  coverageRadius?: string;
}

/**
 * Password change payload for authenticated users.
 */
export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Union response type for authentication actions.
 */
export type AuthResponse = AuthResult | AuthError;

/**
 * Context state exposed by AuthContext to consuming components.
 */
export interface AuthContextValue {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials, persistence?: SessionPersistence) => Promise<AuthResult>;
  registerCustomer: (payload: CustomerRegisterPayload, persistence?: SessionPersistence) => Promise<AuthResult>;
  registerProfessional: (payload: ProfessionalRegisterPayload, persistence?: SessionPersistence) => Promise<AuthResult>;
  requestPasswordReset: (email: string) => Promise<PasswordResetRequestResult>;
  validateResetToken: (token: string) => Promise<ValidateResetTokenResult>;
  resetPassword: (payload: PasswordResetPayload) => Promise<PasswordResetResult>;
  updateUserProfile: (payload: UpdateProfilePayload) => Promise<User>;
  changePassword: (payload: ChangePasswordPayload) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
}

