export interface TopWeeklyFabricItem {
  produitNom: string
  reference: string
  metresVendus: number
  chiffreAffaires: number
}

export interface PriorityDebtorItem {
  clientId: string
  clientNom: string
  clientTelephone?: string | null
  totalDu: number
  joursAncienneteMax: number
}

export interface WeeklySessionResponseDto {
  labelSemaine: string
  dateDebut: string
  dateFin: string
  numeroSemaine: number
  annee: number
  boutiqueId?: string | null
  boutiqueNom?: string | null
  chiffreAffaires: number
  montantEncaisse: number
  nouvellesCreances: number
  tauxRecouvrementPct: number
  metresVendus: number
  nombreVentes: number
  topVentesSemaine: TopWeeklyFabricItem[]
  creancesPrioritaires: PriorityDebtorItem[]
  reapprovisionnementsUrgents: number
  dateGeneration: string
}

export interface ReplenishmentItem {
  produitId: string
  produitNom: string
  produitReference: string
  categorieNom: string
  boutiqueId: string
  boutiqueNom: string
  stockActuelBoutique: number
  seuilAlerte: number
  stockDisponibleEntrepot: number
  quantiteSuggereeTransfert: number
  unite: string
  priorite: 'URGENT' | 'RECOMMANDE' | 'FAIBLE'
  entrepotSourceId?: string
  entrepotSourceNom?: string
}

export interface ReplenishmentSuggestionsResponseDto {
  totalSuggestions: number
  nombreUrgentes: number
  suggestions: ReplenishmentItem[]
}

export interface QueryWeeklySessionDto {
  annee?: number
  numeroSemaine?: number
  boutiqueId?: string
}
