/**
 * Types API complets extraits de afd-textile-app-prompt.md
 * Contrats d'API pour AFD Textile (Boutiques, Stocks, Ventes, Créances, Entrepôt)
 */

export type UserRole = 'ADMIN' | 'gerant' | 'boutiquier'

export interface User {
  id: string
  name: string
  email: string
  telephone?: string
  role: UserRole
  boutiqueId?: string
}

export type LocationType = 'BOUTIQUE' | 'ENTREPOT'

export interface Location {
  id: string
  nom: string
  code: string
  type: LocationType
  ville: string
  adresse?: string
  telephone?: string
  responsableNom?: string
  actif: boolean
}

export type UniteStockage = 'Mètre' | 'Kilo' | 'Yard' | 'Pièce' | 'Tonne' | string

export interface Product {
  id: string
  reference: string
  nom: string
  categorie: string
  couleur?: string
  motif?: string
  prixVente: number
  prixMinimum?: number
  quantite: number
  unite: UniteStockage
  seuilAlerte?: number
  nombrePieces?: number
  nombreTonnes?: number
  photoUrl?: string
  actif: boolean
}

export interface StockLevel {
  id: string
  produitId: string
  produitNom: string
  produitReference: string
  categorie?: string
  locationId: string
  locationNom: string
  locationType: LocationType
  quantite: number
  seuilAlerte: number
  estEnAlerte: boolean
  uniteStockage: UniteStockage
  updatedAt: string
}

export type MoyenPaiement = 'ESPECES' | 'WAVE' | 'ORANGE_MONEY' | 'VIREMENT' | 'AUTRE'
export type VenteStatus = 'CONFIRMEE' | 'ANNULEE' | 'BROUILLON'
export type StatutPaiement = 'SOLDE' | 'PARTIEL' | 'NON_PAYE'

export interface SaleLine {
  produitId: string
  produitNom: string
  produitReference: string
  quantite: number
  unite: UniteStockage
  prixUnitaire: number
  remise: number
  totalLigne: number
}

export interface Sale {
  id: string
  referenceFacture: string
  boutiqueId: string
  boutiqueNom: string
  vendeurId?: string
  vendeurNom: string
  clientId?: string
  clientNom?: string
  clientTelephone?: string
  statut: VenteStatus
  statutPaiement: StatutPaiement
  montantTotal: number
  montantPaye: number
  soldeDu: number
  moyenPaiement: MoyenPaiement
  motifAnnulation?: string
  lignes: SaleLine[]
  createdAt: string
}

export interface Client {
  id: string
  nom: string
  telephone?: string
  adresse?: string
  totalDu: number
  nombreFacturesImpayees: number
  createdAt: string
}

export type TransfertStatus = 'DEMANDE' | 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE' | 'EN_TRANSIT' | 'LIVREE'

export interface Transfert {
  id: string
  reference: string
  produitId?: string
  produitNom?: string
  produitReference?: string
  quantite?: number
  unite?: UniteStockage
  locationSourceId?: string
  locationSourceNom?: string
  locationDestinationId?: string
  locationDestinationNom?: string
  sourceLocationId?: string
  sourceLocationNom?: string
  targetLocationId?: string
  targetLocationNom?: string
  demandeurNom?: string
  statut: TransfertStatus
  priorite?: 'NORMALE' | 'URGENTE'
  motifRefus?: string
  notes?: string
  items?: Array<{ produitNom?: string; quantite?: number; unite?: string; [key: string]: any }>
  lignes?: Array<{ produitNom: string; quantite: number; unite: string }>
  createdAt: string
}

export interface DashboardKpis {
  caJour: number
  caSemaine: number
  nombreVentes: number
  stockTotal: number
  creancesTotal: number
  alertesCount: number
}

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
