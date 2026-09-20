import { create } from 'zustand'
import type { User, UserRole } from '@/types/auth'
import { tokenStore } from '@/lib/tokenStore'

interface AuthState {
  token: string | null
  user: User | null
  isInitialized: boolean
  isAuthenticated: boolean

  // Actions
  setToken: (token: string | null) => void
  setUser: (user: User | null) => void
  setAuth: (token: string, user?: User | null) => void
  clearAuth: () => void
  setInitialized: (initialized: boolean) => void

  // Role & Permission Helpers
  hasRole: (roles: UserRole | UserRole[]) => boolean
  hasPermission: (permission: string) => boolean
}

export const useAuthStore = create<AuthState>((set, get) => {
  const initialToken = tokenStore.get()

  return {
    token: initialToken,
    user: null,
    isInitialized: false,
    isAuthenticated: Boolean(initialToken),

    setToken: (token) => {
      if (token) {
        tokenStore.set(token)
      } else {
        tokenStore.clear()
      }
      set({ token, isAuthenticated: Boolean(token) })
    },

    setUser: (user) => set({ user }),

    setAuth: (token, user = null) => {
      tokenStore.set(token)
      set({
        token,
        user,
        isAuthenticated: true,
        isInitialized: true,
      })
    },

    clearAuth: () => {
      tokenStore.clear()
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isInitialized: true,
      })
    },

    setInitialized: (isInitialized) => set({ isInitialized }),

    hasRole: (roles) => {
      const currentUser = get().user
      if (!currentUser || !currentUser.role) return false

      if (Array.isArray(roles)) {
        return roles.includes(currentUser.role)
      }
      return currentUser.role === roles
    },

    hasPermission: (permission) => {
      const currentUser = get().user
      if (!currentUser) return false
      // Si l'utilisateur est admin, il a accès à tout par défaut
      if (currentUser.role === 'ADMIN') return true
      return Boolean(currentUser.permissions?.includes(permission))
    },
  }
})
