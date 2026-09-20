import type { EncaissementStatus, ModeRemboursement, ModeVentilation, MoyenPaiement } from './enums'
import type { PaginationParams } from './api'

export interface VentilationItem {
  id: string
  venteId: string
  referenceFacture: string
  montantImpute: number
  createdAt: string
}

export interface Encaissement {
  id: string
  referenceRecu: string
  clientId: string
  clientNom: string
  clientTelephone?: string | null
  boutiqueId: string
  boutiqueNom: string
  userId: string
  userNom: string
  montantTotal: number
  modePaiement: MoyenPaiement
  referenceExterne?: string | null
  modeVentilation: ModeVentilation
  statut: EncaissementStatus
  dateEncaissement: string
  ventilations: VentilationItem[]
  createdAt: string
}

export interface Remboursement {
  id: string
  referenceRemboursement: string
  venteId: string
  encaissementId?: string | null
  boutiqueId: string
  boutiqueNom?: string
  montant: number
  modeRemboursement: ModeRemboursement
  auteurId: string
  auteurNom?: string
  motif: string
  createdAt: string
}

export interface ManualVentilationItemDto {
  venteId: string
  montant: number
}

export interface CreateEncaissementDto {
  clientId: string
  boutiqueId?: string
  montantTotal: number
  modePaiement: MoyenPaiement
  referenceExterne?: string
  modeVentilation?: ModeVentilation
  ventilationsManuelles?: ManualVentilationItemDto[]
  dateEncaissement?: string
}

export interface PaymentModeBreakdown {
  modePaiement: MoyenPaiement
  total: number
  nombreTransactions: number
}

export interface CashRegisterSummary {
  boutiqueId?: string | null
  boutiqueNom?: string | null
  dateDebut: string
  dateFin: string
  totalEncaissements: number
  nombreTransactions: number
  parModePaiement: PaymentModeBreakdown[]
  totalRemboursements: number
  soldeNetCaisseEspeces: number
}

export interface PaymentQueryParams extends PaginationParams {
  clientId?: string
  boutiqueId?: string
  modePaiement?: MoyenPaiement
  statut?: EncaissementStatus
  dateDebut?: string
  dateFin?: string
}
