import axios, { AxiosError } from 'axios'
import { tokenStore } from '@/lib/tokenStore'
import { useAuthStore } from '@/stores/useAuthStore'
import type { ApiError } from '@/types/api'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

export const API = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// ─── Request Interceptor (Inject Token) ───────────────────────────────────────

API.interceptors.request.use(
  (config) => {
    const token = tokenStore.get() || useAuthStore.getState().token
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor (Handle 401 & Session Expiry) ───────────────────────

API.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Nettoyer la session dans Zustand et tokenStore
      useAuthStore.getState().clearAuth()

      // Rediriger uniquement si nous ne sommes pas déjà sur une route d'authentification
      const currentPath = window.location.pathname
      if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ─── Helper: Normalisation des erreurs API ────────────────────────────────────

export function getErrorMessage(error: unknown, defaultMessage = 'Une erreur inattendue est survenue.'): string {
  if (axios.isAxiosError(error)) {
    const serverError = error.response?.data as Partial<ApiError> | undefined
    if (serverError?.message) return serverError.message
    if (error.response?.status === 404) return 'Ressource introuvable.'
    if (error.response?.status === 403) return 'Accès non autorisé.'
    if (error.response?.status === 500) return 'Erreur interne du serveur.'
    if (!error.response) return 'Impossible de joindre le serveur. Vérifiez votre connexion.'
  }

  if (error instanceof Error) {
    return error.message
  }

  return defaultMessage
}

export default API