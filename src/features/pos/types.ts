import type { MoyenPaiement } from '../../types/enums';

export type { LigneVente, PosProduit, UniteVente } from './pricing';

export type SalesTab = 'vente' | 'historique';

export const MOTIFS_ANNULATION = [
  'Erreur de saisie',
  'Retour client',
  'Produit défectueux',
  'Autre',
] as const;

/**
 * Modes proposés à la caisse (vente comptant uniquement) et moyen de paiement API correspondant.
 * Les ventes à crédit se font depuis la fiche client (écran Clients & Créances).
 */
export const MODES_PAIEMENT = [
  { label: 'Espèces', api: 'ESPECES' },
  { label: 'Wave', api: 'WAVE' },
  { label: 'Orange Money', api: 'ORANGE_MONEY' },
  { label: 'Free Money', api: 'FREE_MONEY' },
  { label: 'Carte bancaire', api: 'CARTE_BANCAIRE' },
] as const satisfies readonly { label: string; api: MoyenPaiement }[];

export type ModePaiementPos = (typeof MODES_PAIEMENT)[number]['label'];

/** Choix fait dans la fenêtre d'encaissement. */
export interface PaymentChoice {
  mode: ModePaiementPos;
  clientId: string | null;
  clientNom: string;
}
