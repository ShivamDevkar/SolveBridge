/**
 * Authentication Service Interface & Abstract Facade for SolveBid.
 * 
 * ARCHITECTURAL DESIGN:
 * This interface defines the contract that the frontend UI consumes.
 * Currently backed by `mockAuthAdapter` for development and demonstration.
 * When the backend authentication API is finalized, an HTTP adapter implementing
 * `IAuthService` will replace the mock implementation without requiring modifications
 * to UI components or layouts.
 */

import { User } from '@/types/common';
import {
  AuthResult,
  ChangePasswordPayload,
  CustomerRegisterPayload,
  LoginCredentials,
  PasswordResetPayload,
  PasswordResetRequestResult,
  PasswordResetResult,
  ProfessionalRegisterPayload,
  SessionPersistence,
  StoredSessionData,
  UpdateProfilePayload,
  ValidateResetTokenResult,
} from '@/types/auth';
import { mockAuthAdapter } from './mockAuthAdapter';

export interface IAuthService {
  /**
   * Authenticate a user with email and password.
   */
  login(credentials: LoginCredentials, persistence?: SessionPersistence): Promise<AuthResult>;

  /**
   * Register a new Customer account.
   */
  registerCustomer(payload: CustomerRegisterPayload, persistence?: SessionPersistence): Promise<AuthResult>;

  /**
   * Register a new Professional account (starts in UNVERIFIED status).
   */
  registerProfessional(payload: ProfessionalRegisterPayload, persistence?: SessionPersistence): Promise<AuthResult>;

  /**
   * Terminate current session and purge client storage tokens.
   */
  logout(): Promise<void>;

  /**
   * Retrieve and validate stored non-sensitive session from storage.
   * Returns null if no session exists or if session data is malformed.
   */
  getCurrentSession(): Promise<StoredSessionData | null>;

  /**
   * Request self-service password recovery instructions.
   */
  requestPasswordReset(email: string): Promise<PasswordResetRequestResult>;

  /**
   * Validates a simulated password reset token.
   */
  validateResetToken(token: string): Promise<ValidateResetTokenResult>;

  /**
   * Submit new password using a recovery token.
   */
  resetPassword(payload: PasswordResetPayload): Promise<PasswordResetResult>;

  /**
   * Updates supported profile fields for currently authenticated user.
   */
  updateUserProfile(userId: string, payload: UpdateProfilePayload): Promise<User>;

  /**
   * Changes password for an authenticated user requiring current password verification.
   */
  changePassword(email: string, payload: ChangePasswordPayload): Promise<{ success: boolean; message: string }>;
}

/**
 * Active authService instance.
 * Currently bound to mockAuthAdapter for local prototype demonstration.
 */
export const authService: IAuthService = mockAuthAdapter;

