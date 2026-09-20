// ─── User & Roles ─────────────────────────────────────────────────────────────

export type UserRole = 'ADMIN' | 'MANAGER' | 'SELLER' | 'STOCK_MANAGER' | string

export interface User {
  id: number | string
  name: string
  email: string
  role?: UserRole
  avatar?: string
  permissions?: string[]
}

// ─── Auth Requests ────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  passwordConfirmation: string
}

// ─── Auth Responses ───────────────────────────────────────────────────────────

export interface LoginResponse {
  success: true
  token: string
  message?: string
  user?: User
  refreshToken?: string
}

export interface RegisterResponse {
  success: true
  message: string
}

export type { ApiError } from './api'

// ─── Auth Context / Store Contract ────────────────────────────────────────────

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isInitializing: boolean
  loading: boolean // Pour compatibilité ascendante
  login: (token: string, user?: User) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  hasRole: (roles: UserRole | UserRole[]) => boolean
  hasPermission: (permission: string) => boolean
}