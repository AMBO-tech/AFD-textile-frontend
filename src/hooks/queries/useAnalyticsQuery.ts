import { useQuery } from '@tanstack/react-query';
import { analyticsService, type PeriodeAnalytics } from '../../services/analytics.service';

export const ANALYTICS_KEYS = {
  all: ['analytics'] as const,
  kpis: (periode: PeriodeAnalytics, boutiqueId?: string) =>
    [...ANALYTICS_KEYS.all, 'kpis', periode, boutiqueId] as const,
  creances: (boutiqueId?: string) => [...ANALYTICS_KEYS.all, 'creances', boutiqueId] as const,
  tendances: (periode: PeriodeAnalytics, boutiqueId?: string) => [...ANALYTICS_KEYS.all, 'tendances', periode, boutiqueId] as const,
  topTissus: (periode: PeriodeAnalytics, limit: number, boutiqueId?: string) =>
    [...ANALYTICS_KEYS.all, 'top-tissus', periode, limit, boutiqueId] as const,
};

export const useSalesTrendQuery = (periode: PeriodeAnalytics, boutiqueId?: string) =>
  useQuery({
    queryKey: ANALYTICS_KEYS.tendances(periode, boutiqueId),
    queryFn: () => analyticsService.getSalesTrends(periode, boutiqueId),
    staleTime: 1000 * 30,
  });

export const useTopTextilesQuery = (periode: PeriodeAnalytics, limit: number, boutiqueId?: string) =>
  useQuery({
    queryKey: ANALYTICS_KEYS.topTissus(periode, limit, boutiqueId),
    queryFn: () => analyticsService.getTopTextiles(periode, limit, boutiqueId),
    staleTime: 1000 * 30,
  });

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
