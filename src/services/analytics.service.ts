import { API } from './api';

export type PeriodeAnalytics = 'AUJOURDHUI' | 'HIER' | 'CETTE_SEMAINE' | 'CE_MOIS' | 'CE_TRIMESTRE' | 'CETTE_ANNEE';

/** Indicateurs calculés par le serveur (ventes CONFIRMEE uniquement, périmètre boutique pour un boutiquier). */
export interface DashboardKpis {
  caFactureNet: number;
  caEncaisse: number;
  soldeCreancesEnAttente: number;
  nombreVentes: number;
  panierMoyen: number;
  valeurStockDisponible: number;
}

export interface AgingDebtBalance {
  totalCreancesGlobal: number;
}

/**
 * @service analyticsService
 * Contrat : backend NestJS /api/v1/analytics
 */
export const analyticsService = {
  getKpis: async (periode: PeriodeAnalytics, boutiqueId?: string) => {
    const res = await API.get<DashboardKpis>('/analytics/kpis', {
      params: { periode, ...(boutiqueId ? { boutiqueId } : {}) },
    });
    return res.data;
  },

  getAgingDebtBalance: async (boutiqueId?: string) => {
    const res = await API.get<AgingDebtBalance>('/analytics/balance-agee-creances', {
      params: boutiqueId ? { boutiqueId } : {},
    });
    return res.data;
  },
};

export default analyticsService;
