/**
 * Types API génériques pour les réponses et pagination
 */

export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
  timestamp?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PaginationParams {
  page?: number
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
