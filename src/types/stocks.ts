import type {
  LocationType,
  MouvementSens,
  MouvementType,
  TransfertStatus,
  UniteStockage,
} from './enums'
import type { PaginationParams } from './api'

export interface StockLevel {
  id: string
  produitId: string
  produitNom: string
  produitReference: string
  produitPhotoUrl: string
  uniteStockage: UniteStockage
  locationId: string
  locationNom: string
  locationType: LocationType
  quantite: number
  prixVente?: number
  prixMinimum?: number
  prixEffectif: number
  prixMinimumEffectif?: number
  categorieId?: string
  poidsAuMetreKg?: number | null
  longueurRouleauMetres?: number | null
  estEnAlerte: boolean
  updatedAt: string
}

export interface MouvementStock {
  id: string
  type: MouvementType
  sens: MouvementSens
  produitId: string
  produitNom: string
  produitReference: string
  quantite: number
  uniteUtilisee: string
  locationId: string
  locationNom: string
  justification?: string | null
  utilisateurNom: string
  createdAt: string
}

export interface TransferLine {
  id: string
  produitId: string
  produitNom: string
  produitReference: string
  quantite: number
  unite: string
}

export interface Transfert {
  id: string
  reference: string
  statut: TransfertStatus
  locationSourceId?: string | null
  locationSourceNom?: string | null
  locationDestinationId: string
  locationDestinationNom: string
  demandeurNom: string
  valideurNom?: string | null
  annuleurNom?: string | null
  motifAnnulation?: string | null
  lignes: TransferLine[]
  createdAt: string
  validatedAt?: string | null
}

export interface AdjustStockDto {
  produitId: string
  locationId: string
  quantiteAjustement: number
  sens: MouvementSens
  justification: string
}

export interface ExecuteMovementDto {
  type: MouvementType
  sens: MouvementSens
  produitId: string
  locationId: string
  quantite: number
  uniteUtilisee: string
  justification?: string
}

export interface CreateTransfertLineDto {
  produitId: string
  quantite: number
  unite: string
}

export interface CreateTransfertDto {
  locationSourceId?: string
  locationDestinationId: string
  lignes: CreateTransfertLineDto[]
}

export interface StockQueryParams extends PaginationParams {
  locationId?: string
  categorieId?: string
  enAlerteSeulement?: boolean
}

export interface MouvementsQueryParams extends PaginationParams {
  produitId?: string
  locationId?: string
  type?: MouvementType
  dateDebut?: string
  dateFin?: string
}
export type StockEnriched = any;







