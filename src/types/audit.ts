import type { PaginationParams } from './api'

export interface AuditLog {
  id: string
  utilisateurId: string
  utilisateurNom?: string
  action: string
  ressourceType: string
  ressourceId: string
  ancienneValeur?: Record<string, unknown> | null
  nouvelleValeur?: Record<string, unknown> | null
  createdAt: string
}

export interface AuditLogQueryParams extends PaginationParams {
  utilisateurId?: string
  action?: string
  ressourceType?: string
  ressourceId?: string
  dateDebut?: string
  dateFin?: string
}
