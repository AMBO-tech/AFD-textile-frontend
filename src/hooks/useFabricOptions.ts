import { useMemo } from 'react';
import type { FabricOption } from '@/components/ui/fabricOption';
import type { StockLevel } from '@/types/stocks';
import { useProductsQuery, useCategoriesQuery } from './queries/useProductsQuery';
import { useStockLevelsQuery } from './queries/useStocksQuery';

/** Plafond imposé par l'API sur les listes paginées. */
const API_PAGE_MAX = 100;

/**
 * Tissus actifs du catalogue avec leur disponibilité à un emplacement (0 si jamais stocké),
 * prêts pour le sélecteur en tuiles. Renvoie aussi les lignes de stock brutes (prix, seuils).
 */
export function useFabricOptions(locationId: string | undefined, enabled = true) {
  const actif = enabled && Boolean(locationId);
  const { data: catalogueRes, isLoading: chargementCatalogue } = useProductsQuery({ limit: API_PAGE_MAX, statut: 'ACTIF' });
  const { data: categories = [] } = useCategoriesQuery();
  const { data: stockRes, isLoading: chargementStock } = useStockLevelsQuery(
    actif ? { locationId, limit: API_PAGE_MAX } : undefined,
    { enabled: actif },
  );

  return useMemo(() => {
    const stocks = new Map<string, StockLevel>((stockRes?.data ?? []).map((s) => [s.produitId, s]));
    const nomsCategories = new Map(categories.map((c) => [c.id, c.nom]));
    const options: FabricOption[] = (catalogueRes?.data ?? []).map((p) => {
      const s = stocks.get(p.id);
      return {
        produitId: p.id,
        nom: p.nom,
        reference: p.reference,
        categorieId: p.categorie?.id ?? p.categorieId ?? 'sans-categorie',
        categorieNom: p.categorie?.nom ?? nomsCategories.get(p.categorieId ?? '') ?? 'Sans catégorie',
        photoUrl: p.photoUrl,
        disponible: s?.quantite ?? 0,
        unite: p.uniteStockage,
        prix: s?.prixEffectif ?? p.prixIndicatif,
      };
    });
    return { options, stocks, isLoading: chargementCatalogue || (actif && chargementStock) };
  }, [catalogueRes, categories, stockRes, chargementCatalogue, chargementStock, actif]);
}
