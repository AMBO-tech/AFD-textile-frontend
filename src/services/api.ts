import axios, { AxiosError } from 'axios'
import type { ApiError } from '@/types/api'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

export const API = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request Interceptor: inject token from localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('afd_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: handle 401 & log offline warnings
API.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.warn(
      `[AFD API] Network call to ${error.config?.url || 'endpoint'} failed (${error.message || 'Offline'}). Using fallback demo data.`
    )
    if (error.response?.status === 401) {
      localStorage.removeItem('afd_token')
      localStorage.removeItem('afd_user')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export function getErrorMessage(error: unknown, defaultMsg = 'Une erreur est survenue'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined
    if (data?.message) return data.message
    if (error.response?.status === 404) return 'Ressource introuvable'
    if (error.response?.status === 403) return 'Accès refusé'
    if (error.response?.status === 500) return 'Erreur interne du serveur'
  }
  if (error instanceof Error) return error.message
  return defaultMsg
}

export default API
