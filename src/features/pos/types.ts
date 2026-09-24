import type { MoyenPaiement } from '../../types/enums';

export type { LigneVente, PosProduit, UniteVente } from './pricing';

export type SalesTab = 'vente' | 'historique';

export const MOTIFS_ANNULATION = [
  'Erreur de saisie',
  'Retour client',
  'Produit défectueux',
  'Autre',
] as const;

export const MODE_CREDIT = 'Vente à crédit';

/** Modes proposés à la caisse et moyen de paiement API correspondant (null : vente à crédit). */
export const MODES_PAIEMENT = [
  { label: 'Espèces', api: 'ESPECES' },
  { label: 'Wave', api: 'WAVE' },
  { label: 'Orange Money', api: 'ORANGE_MONEY' },
  { label: 'Free Money', api: 'FREE_MONEY' },
  { label: 'Carte bancaire', api: 'CARTE_BANCAIRE' },
  { label: MODE_CREDIT, api: null },
] as const satisfies readonly { label: string; api: MoyenPaiement | null }[];

export type ModePaiementPos = (typeof MODES_PAIEMENT)[number]['label'];

/** Choix fait dans la fenêtre d'encaissement. */
export interface PaymentChoice {
  mode: ModePaiementPos;
  clientId: string | null;
  clientNom: string;
}
