import { useQuery } from '@tanstack/react-query';
import { analyticsService, type PeriodeAnalytics } from '../../services/analytics.service';

export const ANALYTICS_KEYS = {
  all: ['analytics'] as const,
  kpis: (periode: PeriodeAnalytics, boutiqueId?: string) =>
    [...ANALYTICS_KEYS.all, 'kpis', periode, boutiqueId] as const,
  creances: (boutiqueId?: string) => [...ANALYTICS_KEYS.all, 'creances', boutiqueId] as const,
};

/** KPIs du tableau de bord, recalculés par le serveur. Invalidés après chaque vente / règlement. */
export const useDashboardKpisQuery = (periode: PeriodeAnalytics, boutiqueId?: string) =>
  useQuery({
    queryKey: ANALYTICS_KEYS.kpis(periode, boutiqueId),
    queryFn: () => analyticsService.getKpis(periode, boutiqueId),
    staleTime: 1000 * 30,
  });

export const useCreancesTotalQuery = (boutiqueId?: string) =>
  useQuery({
    queryKey: ANALYTICS_KEYS.creances(boutiqueId),
    queryFn: () => analyticsService.getAgingDebtBalance(boutiqueId),
    staleTime: 1000 * 30,
  });
