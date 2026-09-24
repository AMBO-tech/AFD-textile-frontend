/**
 * Types API génériques pour les réponses et pagination
 */

export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
  timestamp?: string
}

/**
 * Réponse paginée — correspond au format backend NestJS.
 * Le backend retourne `data: T[]` (et non `items: T[]`).
 * Les métadonnées sont soit à plat soit dans un objet `meta`.
 */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage?: boolean
  hasPreviousPage?: boolean
  /** Certains endpoints NestJS encapsulent les méta dans un sous-objet */
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface PaginationParams {
  page?: number
  /** Nom attendu par l'API NestJS (max 100). */
  limit?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ApiError {
  success: false
  message: string
  statusCode?: number
  errors?: Record<string, string[] | string>
}
