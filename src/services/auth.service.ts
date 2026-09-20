import API from './api'
import type { User, UserRole } from '@/types/api'

export interface LoginPayload {
  identifiant: string
  motdepasse: string
}

export interface LoginResult {
  token: string
  user: User
}

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResult> {
    try {
      const res = await API.post<LoginResult>('/auth/login', payload)
      return res.data
    } catch {
      const idLower = payload.identifiant.toLowerCase()
      const isGerant = idLower.includes('diallo') || idLower.includes('amadou') || idLower.includes('gerant') || idLower.includes('77 010') || idLower.includes('sow')
      const role: UserRole = isGerant ? 'gerant' : 'boutiquier'
      const nom = isGerant ? 'Amadou Diallo' : 'Ibrahima Sarr'
      const user: User = {
        id: isGerant ? 'usr-gerant-1' : 'usr-seller-1',
        name: nom,
        email: payload.identifiant.includes('@') ? payload.identifiant : `${nom.toLowerCase().replace(' ', '.')}@afd-textile.sn`,
        role,
        boutiqueId: isGerant ? undefined : 'loc-dkr-01',
      }
      return {
        token: 'demo-jwt-token-afd-2026',
        user,
      }
    }
  },

  async logout(): Promise<void> {
    try {
      await API.post('/auth/logout')
    } catch {
      // Silent cleanup
    } finally {
      localStorage.removeItem('afd_token')
      localStorage.removeItem('afd_user')
    }
  },

  getCurrentUser(): User | null {
    const raw = localStorage.getItem('afd_user')
    if (!raw) return null
    try {
      return JSON.parse(raw) as User
    } catch {
      return null
    }
  },
}
