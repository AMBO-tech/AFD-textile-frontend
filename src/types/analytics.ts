export interface DateRange {
  dateDebut: string
  dateFin: string
  label?: string
}

export interface DashboardKpiResponseDto {
  periode: DateRange
  periodePrecedente: DateRange
  caFactureNet: number
  caFactureNetPrecedent: number
  variationCaFactureNetPct: number
  caEncaisse: number
  caEncaissePrecedent: number
  variationCaEncaissePct: number
  soldeCreancesEnAttente: number
  tauxRecouvrementPct: number
  nombreVentes: number
  nombreVentesPrecedent: number
  variationNombreVentesPct: number
  panierMoyen: number
  panierMoyenPrecedent: number
  variationPanierMoyenPct: number
  metresLineairesVendus: number
  rouleauxVendus: number
  valeurStockDisponible: number
}

export interface SalesTrendItem {
  date: string
  label: string
  caFacture: number
  caEncaisse: number
  nombreVentes: number
}

export interface CategoryBreakdownItem {
  categorieId: string
  categorieNom: string
  chiffreAffaires: number
  pourcentageCa: number
  metresVendus: number
  nombreVentes: number
}

export interface StorePerformanceItem {
  boutiqueId: string
  boutiqueNom: string
  chiffreAffaires: number
  caEncaisse: number
  soldeCreances: number
  nombreVentes: number
  panierMoyen: number
}

export interface TopProductPerformanceItem {
  produitId: string
  produitNom: string
  produitReference: string
  categorieNom: string
  photoUrl: string
  metresVendus: number
  chiffreAffaires: number
  margeEstimee?: number
}

export interface StockHealthSummary {
  valeurTotaleStock: number
  nombreReferencesTotal: number
  nombreReferencesEnAlerte: number
  nombreReferencesRupture: number
  totalMetresEnStock: number
  totalRouleauxEnStock: number
}

export interface AgingDebtBucket {
  tranche: string // ex: '0-30 jours', '31-60 jours', '61-90 jours', '+90 jours'
  montantTotal: number
  nombreFactures: number
  nombreClients: number
}

export interface AgingDebtBalanceResponseDto {
  totalCreances: number
  tranches: AgingDebtBucket[]
}

export interface AnalyticsQueryParams {
  boutiqueId?: string
  dateDebut?: string
  dateFin?: string
  periodePredefinie?: 'aujourdhui' | 'cette_semaine' | 'ce_mois' | 'ce_trimestre' | 'cette_annee' | 'personnalise'
}
