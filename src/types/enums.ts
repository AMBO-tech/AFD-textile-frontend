// ==============================================================================
// ÉNUMÉRATIONS MÉTIER AFD-TEXTILE (SYNCHRONISÉES AVEC POSTGRESQL / PRISMA)
// ==============================================================================

export type Role = 'OWNER' | 'BOUTIQUIER'

export type LocationType = 'ENTREPOT' | 'BOUTIQUE'

export type ProductStatus = 'ACTIF' | 'INACTIF'

export type UniteStockage = 'METRE' | 'KG' | 'ROULEAU'

export type MouvementType =
  | 'ENTREE_MANUELLE'
  | 'VENTE'
  | 'TRANSFERT'
  | 'AJUSTEMENT'
  | 'RETOUR'
  | 'PERTE'
  | 'ANNULATION'

export type MouvementSens = 'ENTREE' | 'SORTIE'

export type TransfertStatus = 'DEMANDE' | 'EN_TRANSIT' | 'VALIDE' | 'ANNULE'

export type VenteStatus = 'BROUILLON' | 'CONFIRMEE' | 'ANNULEE' | 'EN_CONFLIT'

export type StatutPaiement = 'NON_PAYE' | 'PARTIEL' | 'SOLDE'

export type SyncStatus = 'SYNCHRONISE' | 'EN_ATTENTE' | 'CONFLIT_STOCK'

export type MoyenPaiement =
  | 'ESPECES'
  | 'WAVE'
  | 'ORANGE_MONEY'
  | 'FREE_MONEY'
  | 'CARTE_BANCAIRE'
  | 'VIREMENT'
  | 'CHEQUE'
  | 'AUTRE'

export type ModeVentilation = 'FIFO_AUTO' | 'MANUELLE'

export type EncaissementStatus = 'VALIDE' | 'ANNULE'

export type ModeRemboursement = 'ESPECES' | 'WAVE' | 'ORANGE_MONEY' | 'VIREMENT'
