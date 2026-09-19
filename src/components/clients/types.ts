import type { LigneProduitCreance, PaiementCreance, Creance, ClientDetailed } from '../../data/useMockStore';

export type { LigneProduitCreance, PaiementCreance, Creance, ClientDetailed };

export const MODES_PAIEMENT = ['Espèces', 'Wave', 'Orange Money', 'Free Money', 'Carte bancaire'] as const;
export const UNITES = ['mètre', 'yard', 'kilo', 'tonne', 'pièce'] as const;

export function soldeClient(c: ClientDetailed): number {
  return c.creances.reduce((s, cr) => {
    const paye = cr.paiements.reduce((sp, p) => sp + p.montant, 0);
    return s + Math.max(0, cr.montantTotal - paye);
  }, 0);
}

export function totalLignes(ls: LigneProduitCreance[]): number {
  return ls.reduce((s, l) => s + l.quantite * l.prixUnitaire, 0);
}
