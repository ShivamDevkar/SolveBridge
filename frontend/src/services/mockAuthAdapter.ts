// [DEV-ONLY FIXTURE]: Client-side prototype simulation. Does NOT provide production security or backend authorization.

import type { User, UserRole, VerificationStatus } from '@/types/common';
import type {
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
import type { IAuthService } from './authService';

const STORAGE_SESSION_KEY = 'solvebid_mock_session';
const SIMULATED_LATENCY_MS = typeof process !== 'undefined' && process.env.NODE_ENV === 'test' ? 0 : 300;

interface MockUserRecord {
  id: string;
  name: string;
  email: string;
  password: string; // [DEV-ONLY FIXTURE]: In-memory only. NEVER persisted to storage.
  role: UserRole;
  verificationStatus?: VerificationStatus;
  phone?: string;
  city?: string;
  businessName?: string;
  category?: string;
  skills?: string[];
  coverageRadius?: string;
}

/**
 * Seed demonstration accounts.
 * Permanently available in development for repeatable demonstration and testing.
 */
const SEED_ACCOUNTS: MockUserRecord[] = [
  {
    id: 'user-demo-customer',
    name: 'Sarthak Chavan',
    email: 'customer@solvebid.demo',
    password: 'demo1234',
    role: 'CUSTOMER',
    phone: '+91 98765 43210',
    city: 'Pune',
  },
  {
    id: 'user-demo-pro',
    name: 'Arun Kumar (Pro HVAC)',
    businessName: 'Arun HVAC Services',
    email: 'pro.hvac@solvebid.demo',
    password: 'demo1234',
    role: 'PROFESSIONAL',
    verificationStatus: 'VERIFIED',
    phone: '+91 98765 43211',
    category: 'Home Appliances & HVAC',
    skills: ['AC Gas Refill & Cooling', 'Compressor Diagnostics'],
    coverageRadius: '15',
  },
  {
    id: 'user-demo-admin',
    name: 'System Administrator',
    email: 'admin@solvebid.demo',
    password: 'demo1234',
    role: 'ADMIN',
  },
];

/**
 * In-memory registry for newly registered accounts during the current browser lifecycle.
 * In accordance with Phase 02 security mandates:
 * - Credentials and passwords exist ONLY in memory and are NEVER written to localStorage or sessionStorage.
 * - After a full page reload, registered accounts may need to re-register, while seed accounts remain.
 */
const inMemoryAccounts = new Map<string, MockUserRecord>();

// Initialize in-memory map with seed accounts
SEED_ACCOUNTS.forEach((acc) => {
  inMemoryAccounts.set(acc.email.toLowerCase(), acc);
});

interface MockPasswordResetTokenRecord {
  token: string;
  email: string;
  userId: string;
  expiresAt: number; // Unix timestamp in ms
  used: boolean;
}

// In-memory token store: token -> record
const inMemoryResetTokens = new Map<string, MockPasswordResetTokenRecord>();
// Account-to-token map for invalidating previous token: email -> token
const emailToActiveToken = new Map<string, string>();

const RESET_TOKEN_EXPIRATION_MS = 15 * 60 * 1000; // 15 minutes

function delay(ms = SIMULATED_LATENCY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateMockToken(userId: string, role: UserRole): string {
  // Explicitly labeled mock token string — never treated as real cryptographic JWT
  return `mock-jwt-token.${btoa(JSON.stringify({ sub: userId, role, iss: 'solvebid-dev-fixture' }))}.${Date.now()}`;
}

function isValidStoredSession(data: unknown): data is StoredSessionData {
  if (!data || typeof data !== 'object') return false;
  const s = data as Record<string, unknown>;
  const validRoles: UserRole[] = ['CUSTOMER', 'PROFESSIONAL', 'ADMIN'];

  return (
    typeof s.userId === 'string' &&
    s.userId.trim() !== '' &&
    typeof s.email === 'string' &&
    s.email.includes('@') &&
    typeof s.name === 'string' &&
    typeof s.mockToken === 'string' &&
    s.mockToken.startsWith('mock-jwt-token') &&
    typeof s.role === 'string' &&
    validRoles.includes(s.role as UserRole)
  );
}

/**
 * Writes non-sensitive session data to chosen storage.
 * NOTE: Plaintext passwords, password hashes, and secrets are strictly excluded.
 */
function saveSessionToStorage(sessionData: StoredSessionData, persistence: SessionPersistence): void {
  const serialized = JSON.stringify(sessionData);
  // Clear any opposing storage first to ensure single authoritative session
  if (persistence === 'local') {
    window.sessionStorage.removeItem(STORAGE_SESSION_KEY);
    window.localStorage.setItem(STORAGE_SESSION_KEY, serialized);
  } else {
    window.localStorage.removeItem(STORAGE_SESSION_KEY);
    window.sessionStorage.setItem(STORAGE_SESSION_KEY, serialized);
  }
}

/**
 * Clears mock session data from all client storage mechanisms.
 */
function clearSessionFromStorage(): void {
  try {
    window.localStorage.removeItem(STORAGE_SESSION_KEY);
    window.sessionStorage.removeItem(STORAGE_SESSION_KEY);
  } catch (err) {
    console.warn('[MockAuthAdapter] Could not clear storage:', err);
  }
}

export const mockAuthAdapter: IAuthService = {
  async login(credentials: LoginCredentials, persistence: SessionPersistence = 'local'): Promise<AuthResult> {
    await delay();

    const normalizedEmail = credentials.email.trim().toLowerCase();
    const account = inMemoryAccounts.get(normalizedEmail);

    if (!account) {
      throw new Error('No account found with this email address.');
    }

    if (account.password !== credentials.password) {
      throw new Error('Incorrect password. Please verify your credentials.');
    }

    // Role verification: If a specific role was selected on the login portal, verify alignment
    if (credentials.role && account.role !== credentials.role) {
      throw new Error(`This account is registered as a ${account.role}. Please select the ${account.role} portal.`);
    }

    const mockToken = generateMockToken(account.id, account.role);
    const sessionData: StoredSessionData = {
      userId: account.id,
      email: account.email,
      name: account.name,
      role: account.role,
      verificationStatus: account.verificationStatus,
      phone: account.phone,
      city: account.city,
      businessName: account.businessName,
      category: account.category,
      skills: account.skills,
      coverageRadius: account.coverageRadius,
      mockToken,
      createdAt: new Date().toISOString(),
    };

    const targetPersistence = credentials.rememberMe !== undefined
      ? (credentials.rememberMe ? 'local' : 'session')
      : persistence;

    saveSessionToStorage(sessionData, targetPersistence);
    const user: User = {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      verificationStatus: account.verificationStatus,
      phone: account.phone,
      city: account.city,
      businessName: account.businessName,
      category: account.category,
      skills: account.skills,
      coverageRadius: account.coverageRadius,
    };

    return {
      success: true,
      user,
      mockToken,
      sessionData,
    };
  },

  async registerCustomer(payload: CustomerRegisterPayload, persistence: SessionPersistence = 'local'): Promise<AuthResult> {
    await delay();

    const normalizedEmail = payload.email.trim().toLowerCase();
    if (inMemoryAccounts.has(normalizedEmail)) {
      throw new Error('An account with this email address already exists.');
    }

    const fullName = payload.firstName && payload.lastName
      ? `${payload.firstName.trim()} ${payload.lastName.trim()}`.trim()
      : ((payload as any).name || 'Customer User').trim();
    const newId = `user-cust-${Date.now()}`;

    // Store in-memory for the duration of this browser process
    const newAccount: MockUserRecord = {
      id: newId,
      name: fullName,
      email: normalizedEmail,
      password: payload.password, // In-memory only
      role: 'CUSTOMER',
      phone: payload.phone.trim(),
      city: payload.city.trim(),
    };

    inMemoryAccounts.set(normalizedEmail, newAccount);

    const mockToken = generateMockToken(newId, 'CUSTOMER');
    const sessionData: StoredSessionData = {
      userId: newId,
      email: normalizedEmail,
      name: fullName,
      role: 'CUSTOMER',
      phone: payload.phone.trim(),
      city: payload.city.trim(),
      mockToken,
      createdAt: new Date().toISOString(),
    };

    saveSessionToStorage(sessionData, persistence);

    const user: User = {
      id: newId,
      name: fullName,
      email: normalizedEmail,
      role: 'CUSTOMER',
      phone: payload.phone.trim(),
      city: payload.city.trim(),
    };

    return {
      success: true,
      user,
      mockToken,
      sessionData,
    };
  },

  async registerProfessional(payload: ProfessionalRegisterPayload, persistence: SessionPersistence = 'local'): Promise<AuthResult> {
    await delay();

    const normalizedEmail = payload.email.trim().toLowerCase();
    if (inMemoryAccounts.has(normalizedEmail)) {
      throw new Error('An account with this business email already exists.');
    }

    const newId = `user-pro-${Date.now()}`;
    const businessName = payload.businessName.trim();

    // Inviolable Rule: Newly registered professionals explicitly start with UNVERIFIED status
    const newAccount: MockUserRecord = {
      id: newId,
      name: businessName,
      businessName,
      email: normalizedEmail,
      password: payload.password, // In-memory only
      role: 'PROFESSIONAL',
      verificationStatus: 'UNVERIFIED',
      phone: payload.phone.trim(),
      category: payload.category.trim(),
      skills: [...payload.skills],
      coverageRadius: payload.coverageRadius.trim(),
    };

    inMemoryAccounts.set(normalizedEmail, newAccount);

    const mockToken = generateMockToken(newId, 'PROFESSIONAL');
    const sessionData: StoredSessionData = {
      userId: newId,
      email: normalizedEmail,
      name: businessName,
      businessName,
      role: 'PROFESSIONAL',
      verificationStatus: 'UNVERIFIED',
      phone: payload.phone.trim(),
      category: payload.category.trim(),
      skills: [...payload.skills],
      coverageRadius: payload.coverageRadius.trim(),
      mockToken,
      createdAt: new Date().toISOString(),
    };

    saveSessionToStorage(sessionData, persistence);

    const user: User = {
      id: newId,
      name: businessName,
      businessName,
      email: normalizedEmail,
      role: 'PROFESSIONAL',
      verificationStatus: 'UNVERIFIED',
      phone: payload.phone.trim(),
      category: payload.category.trim(),
      skills: [...payload.skills],
      coverageRadius: payload.coverageRadius.trim(),
    };

    return {
      success: true,
      user,
      mockToken,
      sessionData,
    };
  },

  async logout(): Promise<void> {
    await delay(100);
    clearSessionFromStorage();
  },

  async getCurrentSession(): Promise<StoredSessionData | null> {
    try {
      // Check localStorage first, then sessionStorage
      const rawLocal = window.localStorage.getItem(STORAGE_SESSION_KEY);
      const rawSession = window.sessionStorage.getItem(STORAGE_SESSION_KEY);
      const raw = rawLocal || rawSession;

      if (!raw) return null;

      const parsed: unknown = JSON.parse(raw);

      if (isValidStoredSession(parsed)) {
        return parsed;
      }

      // If data is corrupt or invalid structure, purge safely to prevent crashes
      console.warn('[MockAuthAdapter] Detected malformed stored session. Purging storage.');
      clearSessionFromStorage();
      return null;
    } catch (err) {
      console.warn('[MockAuthAdapter] Failed to parse stored session:', err);
      clearSessionFromStorage();
      return null;
    }
  },

  async requestPasswordReset(email: string): Promise<PasswordResetRequestResult> {
    await delay();
    const normalized = email.trim().toLowerCase();

    // Invalidate any previously active reset token for this account
    const existingToken = emailToActiveToken.get(normalized);
    if (existingToken) {
      const existingRecord = inMemoryResetTokens.get(existingToken);
      if (existingRecord) {
        existingRecord.used = true;
      }
      emailToActiveToken.delete(normalized);
    }

    const account = inMemoryAccounts.get(normalized);

    // If an account exists, issue simulated single-use token valid for 15 minutes
    if (account) {
      const token = `mock-reset-token-${Math.random().toString(36).substring(2, 10)}-${Date.now()}`;
      const record: MockPasswordResetTokenRecord = {
        token,
        email: normalized,
        userId: account.id,
        expiresAt: Date.now() + RESET_TOKEN_EXPIRATION_MS,
        used: false,
      };
      inMemoryResetTokens.set(token, record);
      emailToActiveToken.set(normalized, token);

      return {
        success: true,
        message: 'If an account exists for this email address, password recovery instructions are ready.',
        mockResetToken: token,
      };
    }

    // Neutral privacy-conscious response for unknown email (does not reveal account existence)
    return {
      success: true,
      message: 'If an account exists for this email address, password recovery instructions are ready.',
    };
  },

  async validateResetToken(token: string): Promise<ValidateResetTokenResult> {
    await delay(100);
    if (!token || typeof token !== 'string' || token.trim() === '') {
      return { valid: false, error: 'Password reset token is missing or malformed.' };
    }

    const cleanToken = token.trim();
    const record = inMemoryResetTokens.get(cleanToken);

    if (!record) {
      return { valid: false, error: 'Invalid or unrecognized reset token. Please request a new recovery link.' };
    }

    if (record.used) {
      return { valid: false, error: 'This password reset link has already been used. Please request a new recovery link.' };
    }

    if (Date.now() > record.expiresAt) {
      return { valid: false, error: 'This password reset link has expired. Reset links are valid for 15 minutes.' };
    }

    return { valid: true, email: record.email };
  },

  async resetPassword(payload: PasswordResetPayload): Promise<PasswordResetResult> {
    await delay();

    const tokenValidation = await this.validateResetToken(payload.token);
    if (!tokenValidation.valid || !tokenValidation.email) {
      throw new Error(tokenValidation.error || 'Invalid or expired reset token.');
    }

    if (!payload.newPassword) {
      throw new Error('New password is required.');
    }

    if (payload.newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    if (payload.newPassword !== payload.confirmPassword) {
      throw new Error('Passwords do not match.');
    }

    const account = inMemoryAccounts.get(tokenValidation.email);
    if (!account) {
      throw new Error('Account associated with this reset token could not be found.');
    }

    // Update password in in-memory store
    account.password = payload.newPassword;

    // Invalidate token after single use
    const tokenRecord = inMemoryResetTokens.get(payload.token.trim());
    if (tokenRecord) {
      tokenRecord.used = true;
    }
    emailToActiveToken.delete(tokenValidation.email);

    return {
      success: true,
      message: 'Your password has been successfully updated. You may now sign in with your new credentials.',
    };
  },

  async updateUserProfile(userId: string, payload: UpdateProfilePayload): Promise<User> {
    await delay();

    let targetAccount: MockUserRecord | undefined;
    for (const acc of inMemoryAccounts.values()) {
      if (acc.id === userId) {
        targetAccount = acc;
        break;
      }
    }

    if (!targetAccount) {
      throw new Error('User account not found.');
    }

    // Apply allowed profile updates (strictly excluding role and verificationStatus)
    if (payload.name !== undefined) {
      targetAccount.name = payload.name.trim();
    }
    if (payload.phone !== undefined) {
      targetAccount.phone = payload.phone.trim();
    }
    if (payload.city !== undefined) {
      targetAccount.city = payload.city.trim();
    }
    if (payload.businessName !== undefined) {
      targetAccount.businessName = payload.businessName.trim();
      targetAccount.name = payload.businessName.trim();
    }
    if (payload.category !== undefined) {
      targetAccount.category = payload.category.trim();
    }
    if (payload.skills !== undefined) {
      targetAccount.skills = [...payload.skills];
    }
    if (payload.coverageRadius !== undefined) {
      targetAccount.coverageRadius = payload.coverageRadius.trim();
    }

    // Synchronize session storage if an active session exists
    const rawLocal = window.localStorage.getItem(STORAGE_SESSION_KEY);
    const rawSession = window.sessionStorage.getItem(STORAGE_SESSION_KEY);
    const activeStorage = rawLocal ? 'local' : rawSession ? 'session' : null;

    if (activeStorage) {
      const activeRaw = activeStorage === 'local' ? rawLocal : rawSession;
      try {
        const parsed = JSON.parse(activeRaw!) as StoredSessionData;
        if (parsed.userId === userId) {
          parsed.name = targetAccount.name;
          parsed.phone = targetAccount.phone;
          parsed.city = targetAccount.city;
          parsed.businessName = targetAccount.businessName;
          parsed.category = targetAccount.category;
          parsed.skills = targetAccount.skills;
          parsed.coverageRadius = targetAccount.coverageRadius;
          saveSessionToStorage(parsed, activeStorage);
        }
      } catch (e) {
        // Safe fallback
      }
    }

    return {
      id: targetAccount.id,
      name: targetAccount.name,
      email: targetAccount.email,
      role: targetAccount.role,
      verificationStatus: targetAccount.verificationStatus,
      phone: targetAccount.phone,
      city: targetAccount.city,
      businessName: targetAccount.businessName,
      category: targetAccount.category,
      skills: targetAccount.skills,
      coverageRadius: targetAccount.coverageRadius,
    };
  },

  async changePassword(email: string, payload: ChangePasswordPayload): Promise<{ success: boolean; message: string }> {
    await delay();

    const normalizedEmail = email.trim().toLowerCase();
    const account = inMemoryAccounts.get(normalizedEmail);

    if (!account) {
      throw new Error('User account not found.');
    }

    if (account.password !== payload.currentPassword) {
      throw new Error('Current password is incorrect.');
    }

    if (!payload.newPassword || payload.newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long.');
    }

    if (payload.newPassword !== payload.confirmPassword) {
      throw new Error('New passwords do not match.');
    }

    account.password = payload.newPassword;

    return {
      success: true,
      message: 'Your password has been successfully updated.',
    };
  },
};

