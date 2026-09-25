import { useQueries } from '@tanstack/react-query';
import { reportsService, type FiltreRapport } from '../../services/reports.service';

/** Sous la clé ['analytics'] : les ventes, annulations et règlements rafraîchissent aussi les rapports. */
export const REPORT_KEYS = {
  all: ['analytics', 'rapports'] as const,
  section: (section: string, f: FiltreRapport) => [...REPORT_KEYS.all, section, f] as const,
};

const SECTIONS = ['kpis', 'tendance', 'tissus', 'categories', 'boutiques', 'creances', 'stock'] as const;

/**
 * Toutes les sections d'un rapport, chargées en parallèle. Une période personnalisée incomplète
 * (date manquante) ne déclenche aucun appel.
 */
export function useReport(filtre: FiltreRapport) {
  const pret = filtre.periode !== 'PERSONNALISE' || Boolean(filtre.dateDebut && filtre.dateFin);
  const [kpis, tendance, tissus, categories, boutiques, creances, stock] = useQueries({
    queries: SECTIONS.map((section) => ({
      queryKey: REPORT_KEYS.section(section, filtre),
      queryFn: () => reportsService[section](filtre),
      enabled: pret,
      staleTime: 1000 * 30,
    })),
  });
  const toutes = [kpis, tendance, tissus, categories, boutiques, creances, stock];
  return {
    pret,
    kpis: kpis.data as Awaited<ReturnType<typeof reportsService.kpis>> | undefined,
    tendance: tendance.data as Awaited<ReturnType<typeof reportsService.tendance>> | undefined,
    tissus: tissus.data as Awaited<ReturnType<typeof reportsService.tissus>> | undefined,
    categories: categories.data as Awaited<ReturnType<typeof reportsService.categories>> | undefined,
    boutiques: boutiques.data as Awaited<ReturnType<typeof reportsService.boutiques>> | undefined,
    creances: creances.data as Awaited<ReturnType<typeof reportsService.creances>> | undefined,
    stock: stock.data as Awaited<ReturnType<typeof reportsService.stock>> | undefined,
    isLoading: toutes.some((q) => q.isLoading),
    erreur: toutes.find((q) => q.error)?.error ?? null,
    refetch: () => toutes.forEach((q) => q.refetch()),
    isFetching: toutes.some((q) => q.isFetching),
  };
}
