import type { MoyenPaiement, StatutPaiement, SyncStatus, VenteStatus } from './enums'
import type { PaginationParams } from './api'

export interface SaleLine {
  id: string
  produitId: string
  produitNom: string
  produitReference: string
  quantite: number
  uniteSaisie: string
  longueurDecoupeMetres?: number | null
  prixUnitaireApplique: number
  remiseMontant: number
  totalLigne: number
}

export interface Vente {
  id: string
  referenceFacture: string
  boutiqueId: string
  boutiqueNom: string
  vendeurId: string
  vendeurNom: string
  clientId?: string | null
  clientNom?: string | null
  clientTelephone?: string | null
  statut: VenteStatus
  statutPaiement: StatutPaiement
  montantTotal: number
  montantPaye: number
  soldeDu: number
  dateEcheance?: string | null
  synchronisationStatus: SyncStatus
  motifAnnulation?: string | null
  annuleParNom?: string | null
  annuleAt?: string | null
  lignes: SaleLine[]
  createdAt: string
  updatedAt: string
}

export interface CreateSaleLineDto {
  produitId: string
  quantite: number
  uniteSaisie: string
  longueurDecoupeMetres?: number
  /** Ignoré par le serveur, qui fixe lui-même le prix. */
  prixUnitaireApplique?: number
  remiseMontant?: number
}

export interface InitialPaymentDto {
  montant: number
  modePaiement: MoyenPaiement
  referenceExterne?: string
}

export interface CreateSaleDto {
  boutiqueId?: string
  clientId?: string
  lignes: CreateSaleLineDto[]
  paiementInitial?: InitialPaymentDto
  dateEcheance?: string
  idempotencyKey?: string
}

export interface CancelSaleDto {
  motif: string
}

export interface SaleQueryParams extends PaginationParams {
  boutiqueId?: string
  clientId?: string
  vendeurId?: string
  statut?: VenteStatus
  statutPaiement?: StatutPaiement
  dateDebut?: string
  dateFin?: string
}

export interface SyncOfflineSaleItemResult {
  status: 'SUCCESS' | 'CONFLICT' | 'ERROR'
  idempotencyKey?: string
  referenceFacture?: string
  message?: string
  data?: Vente
}

export interface SyncOfflineSalesResponse {
  total: number
  reussies: number
  echecs: number
  details: SyncOfflineSaleItemResult[]
}
