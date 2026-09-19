import type { Produit, Vente } from '../../data/useMockStore';

export interface LigneVente {
  produit: Produit;
  qte: number;
  unite: string;
  remise: number;
}

export type SalesTab = 'vente' | 'historique';

export const MOTIFS_ANNULATION = [
  'Erreur de saisie',
  'Retour client',
  'Produit défectueux',
  'Autre',
] as const;

export const MODES_PAIEMENT = [
  'Espèces',
  'Wave',
  'Orange Money',
  'Free Money',
  'Carte bancaire',
] as const;

export const UNITES = ['mètre', 'yard', 'kilo', 'tonne', 'pièce'] as const;
