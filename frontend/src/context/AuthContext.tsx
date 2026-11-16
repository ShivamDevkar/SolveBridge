import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, UserRole } from '@/types/common';
import {
  AuthContextValue,
  AuthResult,
  ChangePasswordPayload,
  CustomerRegisterPayload,
  LoginCredentials,
  PasswordResetPayload,
  PasswordResetRequestResult,
  PasswordResetResult,
  ProfessionalRegisterPayload,
  SessionPersistence,
  UpdateProfilePayload,
  ValidateResetTokenResult,
} from '@/types/auth';
import { authService } from '@/services/authService';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const initializedRef = useRef(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Rehydrate authentication state on initial application load
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    async function initSession() {
      try {
        const storedSession = await authService.getCurrentSession();
        if (storedSession) {
          const restoredUser: User = {
            id: storedSession.userId,
            name: storedSession.name,
            email: storedSession.email,
            role: storedSession.role,
            verificationStatus: storedSession.verificationStatus,
          };
          setUser(restoredUser);
          setRole(storedSession.role);
        } else {
          setUser(null);
          setRole(null);
        }
      } catch (err) {
        console.warn('[AuthProvider] Failed to rehydrate session:', err);
        setUser(null);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    }

    initSession();
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials, persistence: SessionPersistence = 'local'): Promise<AuthResult> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await authService.login(credentials, persistence);
        setUser(result.user);
        setRole(result.user.role);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Authentication failed. Please try again.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const registerCustomer = useCallback(
    async (payload: CustomerRegisterPayload, persistence: SessionPersistence = 'local'): Promise<AuthResult> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await authService.registerCustomer(payload, persistence);
        setUser(result.user);
        setRole(result.user.role);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const registerProfessional = useCallback(
    async (payload: ProfessionalRegisterPayload, persistence: SessionPersistence = 'local'): Promise<AuthResult> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await authService.registerProfessional(payload, persistence);
        setUser(result.user);
        setRole(result.user.role);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Professional registration failed. Please try again.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const requestPasswordReset = useCallback(async (email: string): Promise<PasswordResetRequestResult> => {
    setIsLoading(true);
    setError(null);
    try {
      return await authService.requestPasswordReset(email);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password reset request failed. Please try again.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const validateResetToken = useCallback(async (token: string): Promise<ValidateResetTokenResult> => {
    return await authService.validateResetToken(token);
  }, []);

  const resetPassword = useCallback(async (payload: PasswordResetPayload): Promise<PasswordResetResult> => {
    setIsLoading(true);
    setError(null);
    try {
      return await authService.resetPassword(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password reset failed. Please try again.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUserProfile = useCallback(async (payload: UpdateProfilePayload): Promise<User> => {
    if (!user) throw new Error('Cannot update profile without an active session.');
    setIsLoading(true);
    setError(null);
    try {
      const updatedUser = await authService.updateUserProfile(user.id, payload);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const changePassword = useCallback(async (payload: ChangePasswordPayload): Promise<{ success: boolean; message: string }> => {
    if (!user) throw new Error('Cannot change password without an active session.');
    setIsLoading(true);
    setError(null);
    try {
      return await authService.changePassword(user.email, payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to change password.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setRole(null);
      setError(null);
      setIsLoading(false);
    }
  }, []);

  const value: AuthContextValue = {
    user,
    role,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    registerCustomer,
    registerProfessional,
    requestPasswordReset,
    validateResetToken,
    resetPassword,
    updateUserProfile,
    changePassword,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Access the global authentication context.
 * Throws an explicit error if invoked outside of `<AuthProvider>`.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
}

