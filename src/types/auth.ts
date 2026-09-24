// ─── User & Roles ─────────────────────────────────────────────────────────────

export type UserRole = 'OWNER' | 'BOUTIQUIER' | 'gerant' | 'boutiquier' | string;

export interface User {
  id: string;
  nom: string;
  telephone: string;
  email?: string | null;
  role: UserRole;
  locationId?: string | null;
  premiereConnexion?: boolean;
  actif?: boolean;
  // Aliases pour rétrocompatibilité UI et Figma
  name?: string;
  boutiqueId?: string;
  avatar?: string;
  permissions?: string[];
}

// ─── Auth Requests ────────────────────────────────────────────────────────────

export interface LoginRequest {
  identifier: string; // Email ou Téléphone
  motDePasse: string;
  // Support rétrocompatible
  email?: string;
  password?: string;
}

export interface RegisterRequest {
  nom: string;
  telephone: string;
  email?: string;
  motDePasse: string;
  name?: string;
  password?: string;
  passwordConfirmation?: string;
}

// ─── Auth Responses ───────────────────────────────────────────────────────────

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  user: User;
  // Compatibilité
  token?: string;
  success?: boolean;
  message?: string;
}

export type LoginResponse = AuthResponse;

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: User;
}

export type { ApiError } from './api';

// ─── Auth Context / Store Contract ────────────────────────────────────────────

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
}
