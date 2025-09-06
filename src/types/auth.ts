export interface AuthSession {
  hashedCode: string;
  loggedInAt: string;
  role: string;
}

export interface LoginCredentials {
  code: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  session: AuthSession | null;
  role: string | null;
}

export const VALID_CODES = {
  'pbiteye32ajcdc': 'Secrétaire Principal',
  'fka64ajcdc': 'Secrétaire Adjoint'
} as const;

export type ValidCode = keyof typeof VALID_CODES;

