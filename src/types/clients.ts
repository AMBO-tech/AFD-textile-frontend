import type { ProductStatus, StatutPaiement, VenteStatus, MoyenPaiement } from './enums'
import type { PaginationParams } from './api'

export interface Client {
  id: string
  nom: string
  telephone?: string | null
  entreprise?: string | null
  adresse?: string | null
  notes?: string | null
  statut: ProductStatus
  totalDu?: number
  nombreFacturesImpayees?: number
  createdAt: string
  updatedAt: string
}

export interface CreateClientDto {
  nom: string
  telephone?: string
  entreprise?: string
  adresse?: string
  notes?: string
}

export interface UpdateClientDto {
  nom?: string
  telephone?: string
  entreprise?: string
  adresse?: string
  notes?: string
  statut?: ProductStatus
}

export interface ClientQueryParams extends PaginationParams {
  statut?: ProductStatus
  avecDetteSeulement?: boolean
}

export interface ClientInvoiceDebtDto {
  id: string
  referenceFacture: string
  boutiqueNom: string
  statut: VenteStatus
  statutPaiement: StatutPaiement
  montantTotal: number
  montantPaye: number
  soldeDu: number
  dateEcheance?: string | null
  createdAt: string
}

export interface ClientPaymentHistoryDto {
  id: string
  referenceRecu: string
  montantTotal: number
  modePaiement: MoyenPaiement
  referenceExterne?: string | null
  dateEncaissement: string
}

export interface ClientDebtsStatementDto {
  clientId: string
  clientNom: string
  clientTelephone?: string | null
  totalSoldeDu: number
  nombreFacturesImpayees: number
  facturesImpayees: ClientInvoiceDebtDto[]
  historiqueEncaissements: ClientPaymentHistoryDto[]
}

export interface LigneProduitCreance {
  nom: string;
  quantite: number;
  unite: string;
  prixUnitaire: number;
}
export interface PaiementCreance {
  id: string;
  montant: number;
  mode: string;
  date: string;
}
export interface Creance {
  id: string;
  date: string;
  montantTotal: number;
  paiements: PaiementCreance[];
  lignes: LigneProduitCreance[];
}
export interface ClientDetailed extends Client { boutiqueId?: string; boutique?: string;
  creances: Creance[];
}
