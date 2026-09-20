import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserRole } from '@/types/api'

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean

  setAuth: (token: string, user: User) => void
  logout: () => void
  hasRole: (roles: UserRole | UserRole[]) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: 'demo-jwt-token-afd-2026',
      user: {
        id: 'usr-gerant-1',
        name: 'Amadou Diallo',
        email: 'amadou.diallo@afd-textile.sn',
        role: 'gerant',
      },
      isAuthenticated: true,

      setAuth: (token, user) => {
        localStorage.setItem('afd_token', token)
        localStorage.setItem('afd_user', JSON.stringify(user))
        set({ token, user, isAuthenticated: true })
      },

      logout: () => {
        localStorage.removeItem('afd_token')
        localStorage.removeItem('afd_user')
        set({ token: null, user: null, isAuthenticated: false })
      },

      hasRole: (roles) => {
        const u = get().user
        if (!u) return false
        if (Array.isArray(roles)) return roles.includes(u.role)
        return u.role === roles
      },
    }),
    {
      name: 'afd-auth-store',
    }
  )
)
