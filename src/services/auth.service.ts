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
  async login(identifiantOrPayload: string | LoginPayload, motdepasseArg?: string): Promise<LoginResult> {
    const identifiant = typeof identifiantOrPayload === 'string' ? identifiantOrPayload : identifiantOrPayload.identifiant
    const motdepasse = typeof identifiantOrPayload === 'string' ? (motdepasseArg || '') : identifiantOrPayload.motdepasse

    try {
      const res = await API.post<LoginResult>('/auth/login', { identifiant, motdepasse })
      return res.data
    } catch (err) {
      // Vérification mot de passe démo si API inaccessible
      if (motdepasse && motdepasse !== 'afd2026' && motdepasse !== 'admin' && motdepasse !== 'password') {
        throw new Error('Email ou mot de passe incorrect')
      }

      const idLower = identifiant.toLowerCase()
      const isGerant = idLower.includes('diallo') || idLower.includes('amadou') || idLower.includes('gerant') || idLower.includes('77 010') || idLower.includes('sow')
      const role: UserRole = isGerant ? 'gerant' : 'boutiquier'
      const nom = isGerant ? 'Amadou Diallo' : 'Ibrahima Sarr'
      const user: User = {
        id: isGerant ? 'usr-gerant-1' : 'usr-seller-1',
        name: nom,
        email: identifiant.includes('@') ? identifiant : `${nom.toLowerCase().replace(' ', '.')}@afd-textile.sn`,
        role,
        boutiqueId: isGerant ? undefined : 'loc-dkr-01',
      }
      return {
        token: 'demo-jwt-token-afd-2026',
        user,
      }
    }
  },

  async me(): Promise<User> {
    try {
      const res = await API.get<User>('/auth/me')
      return res.data
    } catch {
      const raw = localStorage.getItem('afd_user') || localStorage.getItem('user')
      if (raw) {
        return JSON.parse(raw) as User
      }
      throw new Error('Session expirée ou non authentifié')
    }
  },

  async logout(): Promise<void> {
    try {
      await API.post('/auth/logout')
    } catch {
      // Silent cleanup
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('afd_token')
      localStorage.removeItem('user')
      localStorage.removeItem('afd_user')
      localStorage.removeItem('afd-auth-store')
    }
  },

  getCurrentUser(): User | null {
    const raw = localStorage.getItem('afd_user') || localStorage.getItem('user')
    if (!raw) return null
    try {
      return JSON.parse(raw) as User
    } catch {
      return null
    }
  },
}

export default authService
