import type { UniteStockage } from '@/types/enums';

export interface FabricOption {
  produitId: string;
  nom: string;
  reference: string;
  categorieId: string;
  categorieNom: string;
  photoUrl?: string | null;
  /** Quantité disponible à l'emplacement concerné, dans l'unité de stockage. */
  disponible: number;
  unite: UniteStockage;
  /** Prix unitaire affiché (facultatif). */
  prix?: number;
}

/** « asc » : les moins disponibles d'abord (réassort) ; « desc » : les plus disponibles d'abord. */
export type TriDisponibilite = 'asc' | 'desc';

const UNITE_COURTE: Record<UniteStockage, string> = { METRE: 'm', KG: 'kg', ROULEAU: 'rl' };

export const libelleQuantite = (q: number, unite: UniteStockage) =>
  `${Number.isInteger(q) ? q : Number(q.toFixed(2))} ${UNITE_COURTE[unite]}`;

export const trierParDisponibilite = <T extends { disponible: number; nom: string }>(liste: T[], tri: TriDisponibilite) =>
  [...liste].sort((a, b) => (tri === 'asc' ? a.disponible - b.disponible : b.disponible - a.disponible) || a.nom.localeCompare(b.nom));

/**
 * Grille de tuiles pilotée par la largeur de son conteneur (le parent doit porter `@container`) :
 * ~150 px minimum par tuile, du téléphone à l'écran large.
 */
export const GRILLE_TUILES = 'grid grid-cols-2 @md:grid-cols-3 @2xl:grid-cols-4 @4xl:grid-cols-5 @6xl:grid-cols-6 gap-3';
