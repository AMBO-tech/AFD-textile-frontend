import { API } from './api';

export type PeriodeRapport =
  | 'AUJOURDHUI'
  | 'HIER'
  | 'CETTE_SEMAINE'
  | 'CE_MOIS'
  | 'CE_TRIMESTRE'
  | 'CETTE_ANNEE'
  | 'PERSONNALISE';

export type Granularite = 'JOUR' | 'SEMAINE' | 'MOIS';

/** Filtres communs à tous les rapports (périmètre réseau si boutiqueId est absent). */
export interface FiltreRapport {
  periode: PeriodeRapport;
  /** ISO 8601, requis pour PERSONNALISE. */
  dateDebut?: string;
  dateFin?: string;
  boutiqueId?: string;
}

export interface KpisRapport {
  periode: { dateDebut: string; dateFin: string; label: string };
  periodePrecedente: { dateDebut: string; dateFin: string; label: string };
  caFactureNet: number;
  variationCaFactureNetPct: number;
  caEncaisse: number;
  variationCaEncaissePct: number;
  soldeCreancesEnAttente: number;
  tauxRecouvrementPct: number;
  nombreVentes: number;
  variationNombreVentesPct: number;
  panierMoyen: number;
  variationPanierMoyenPct: number;
  metresLineairesVendus: number;
  rouleauxVendus: number;
  valeurStockDisponible: number;
}

export interface PointTendance {
  date: string;
  label: string;
  caFacture: number;
  caEncaisse: number;
  soldeCredit: number;
  nombreVentes: number;
  metresVendus: number;
}

export interface TendanceRapport {
  granularite: Granularite;
  totalCaFacture: number;
  totalCaEncaisse: number;
  points: PointTendance[];
}

export interface TissuRapport {
  produitId: string;
  produitNom: string;
  produitReference: string;
  categorieNom: string;
  chiffreAffaires: number;
  quantiteVendue: number;
  unitePrincipale: string;
  nombreVentes: number;
  partCaPourcentage: number;
}

export interface CategorieRapport {
  categorieId: string;
  categorieNom: string;
  chiffreAffaires: number;
  partCaPourcentage: number;
  metresVendus: number;
  nombreLignesVente: number;
}

export interface BoutiqueRapport {
  boutiqueId: string;
  boutiqueNom: string;
  boutiqueAdresse?: string | null;
  chiffreAffaires: number;
  montantEncaisse: number;
  soldeCreances: number;
  nombreVentes: number;
  panierMoyen: number;
  partCaPourcentage: number;
  metresVendus: number;
}

export interface TrancheCreances {
  montant: number;
  pourcentage: number;
  nombreFactures: number;
}

export interface CreancesRapport {
  totalCreancesGlobal: number;
  moinsDe30Jours: TrancheCreances;
  entre31Et60Jours: TrancheCreances;
  entre61Et90Jours: TrancheCreances;
  plusDe90Jours: TrancheCreances;
  topDebiteurs: {
    clientId: string;
    clientNom: string;
    clientTelephone: string;
    totalDu: number;
    nombreFacturesImpayees: number;
    joursAncienneteMax: number;
  }[];
}

export interface StockRapport {
  valeurTotaleStock: number;
  nombreTotalReferences: number;
  nombreRuptures: number;
  nombreStockBas: number;
  nombreStockSain: number;
  produitsEnAlerte: {
    produitId: string;
    produitNom: string;
    produitReference: string;
    categorieNom: string;
    boutiqueNom: string;
    quantiteActuelle: number;
    seuilAlerte: number;
    unite: string;
    statutAlerte: 'RUPTURE' | 'STOCK_BAS' | string;
  }[];
  produitsDormants: {
    produitId: string;
    produitNom: string;
    categorieNom: string;
    quantiteEnStock: number;
    joursSansVente: number;
  }[];
}

/** Granularité lisible selon la période : jours pour une semaine ou un mois, semaines, puis mois. */
export const granularitePour = (f: FiltreRapport): Granularite => {
  if (f.periode === 'CE_TRIMESTRE') return 'SEMAINE';
  if (f.periode === 'CETTE_ANNEE') return 'MOIS';
  if (f.periode === 'PERSONNALISE' && f.dateDebut && f.dateFin) {
    const jours = (new Date(f.dateFin).getTime() - new Date(f.dateDebut).getTime()) / 86_400_000;
    return jours > 180 ? 'MOIS' : jours > 45 ? 'SEMAINE' : 'JOUR';
  }
  return 'JOUR';
};

const params = (f: FiltreRapport, extra: Record<string, unknown> = {}) => ({
  periode: f.periode,
  ...(f.periode === 'PERSONNALISE' ? { dateDebut: f.dateDebut, dateFin: f.dateFin } : {}),
  ...(f.boutiqueId ? { boutiqueId: f.boutiqueId } : {}),
  ...extra,
});

/** Nombre de lignes demandées pour les palmarès (plafond API : 50). */
export const TOP_RAPPORT = 10;

/**
 * @service reportsService
 * Rapports du gérant : /analytics/* avec période (prédéfinie ou personnalisée) et boutique facultative.
 */
export const reportsService = {
  kpis: async (f: FiltreRapport) => (await API.get<KpisRapport>('/analytics/kpis', { params: params(f) })).data,
  tendance: async (f: FiltreRapport) =>
    (await API.get<TendanceRapport>('/analytics/tendances-ventes', { params: params(f, { granularite: granularitePour(f) }) })).data,
  tissus: async (f: FiltreRapport) =>
    (await API.get<{ totalCaGlobal: number; produits: TissuRapport[] }>('/analytics/top-tissus', { params: params(f, { limit: TOP_RAPPORT }) })).data,
  categories: async (f: FiltreRapport) =>
    (await API.get<{ totalCaGlobal: number; categories: CategorieRapport[] }>('/analytics/categories-repartition', { params: params(f) })).data,
  boutiques: async (f: FiltreRapport) =>
    (await API.get<{ totalCaReseau: number; boutiques: BoutiqueRapport[] }>('/analytics/benchmark-boutiques', { params: params(f) })).data,
  creances: async (f: FiltreRapport) =>
    (await API.get<CreancesRapport>('/analytics/balance-agee-creances', { params: f.boutiqueId ? { boutiqueId: f.boutiqueId } : {} })).data,
  stock: async (f: FiltreRapport) =>
    (await API.get<StockRapport>('/analytics/sante-stocks', { params: f.boutiqueId ? { boutiqueId: f.boutiqueId } : {} })).data,
};

export default reportsService;
