import { create } from 'zustand'
import type { User, UserRole } from '@/types/api'
import { authService } from '@/services/auth.service'

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean

  login: (email: string, password: string) => Promise<void>
  setAuth: (token: string, user: User) => void
  logout: () => void
  checkAuth: () => Promise<void>
  hasRole: (roles: UserRole | UserRole[]) => boolean
}

// Récupération initiale propre depuis localStorage (sans mock hardcodé)
const initialToken =
  typeof window !== 'undefined'
    ? localStorage.getItem('token') || localStorage.getItem('afd_token') || null
    : null

const initialUser: User | null =
  typeof window !== 'undefined'
    ? (() => {
        try {
          const raw = localStorage.getItem('user') || localStorage.getItem('afd_user')
          return raw ? JSON.parse(raw) : null
        } catch {
          return null
        }
      })()
    : null

export const useAuthStore = create<AuthState>((set, get) => ({
  token: initialToken,
  user: initialUser,
  // Authentifié seulement si token ET user existent
  isAuthenticated: !!(initialToken && initialUser),
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true })
    try {
      const res = await authService.login(email, password)
      localStorage.setItem('token', res.token)
      localStorage.setItem('afd_token', res.token)
      localStorage.setItem('user', JSON.stringify(res.user))
      localStorage.setItem('afd_user', JSON.stringify(res.user))
      set({
        token: res.token,
        user: res.user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  setAuth: (token: string, user: User) => {
    localStorage.setItem('token', token)
    localStorage.setItem('afd_token', token)
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('afd_user', JSON.stringify(user))
    set({ token, user, isAuthenticated: true, isLoading: false })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('afd_token')
    localStorage.removeItem('user')
    localStorage.removeItem('afd_user')
    localStorage.removeItem('afd-auth-store')
    set({ token: null, user: null, isAuthenticated: false, isLoading: false })
  },

  checkAuth: async () => {
    const { token, user } = get()
    if (!token) {
      set({ isAuthenticated: false, user: null, isLoading: false })
      return
    }

    if (token && !user) {
      set({ isLoading: true })
      try {
        const u = await authService.me()
        localStorage.setItem('user', JSON.stringify(u))
        localStorage.setItem('afd_user', JSON.stringify(u))
        set({ user: u, isAuthenticated: true, isLoading: false })
      } catch {
        get().logout()
      }
    }
  },

  hasRole: (roles) => {
    const u = get().user
    if (!u) return false
    if (Array.isArray(roles)) return roles.includes(u.role)
    return u.role === roles
  },
}))

export default useAuthStore
