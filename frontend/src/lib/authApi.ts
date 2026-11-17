import { apiFetch } from "./api";

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
}

interface CurrentUserResponse {
  success: boolean;
  data: {
    user: AuthUser;
  };
}

export function getCurrentUser() {
  return apiFetch<CurrentUserResponse>("auth/me");
}
