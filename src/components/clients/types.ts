

;

export const MODES_PAIEMENT = ['Espèces', 'Wave', 'Orange Money', 'Free Money', 'Carte bancaire'] as const;
export const UNITES = ['mètre', 'yard', 'kilo', 'tonne', 'pièce'] as const;

export function soldeClient(c: ClientDetailed): number {
  return c.creances.reduce((s: any, cr: any) => {
    const paye = cr.paiements.reduce((sp: any, p: any) => sp + p.montant, 0);
    return s + Math.max(0, cr.montantTotal - paye);
  }, 0);
}

export function totalLignes(ls: LigneProduitCreance[]): number {
  return ls.reduce((s: any, l: any) => s + l.quantite * l.prixUnitaire, 0);
}
