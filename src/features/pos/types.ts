import React from 'react';
import { Banknote, Smartphone, CreditCard, FileText } from 'lucide-react';
import type { DropdownOption } from '../../components/ui/CustomDropdownSelect';
import type { StockEnriched } from '../../data/useMockStore';

export interface LigneVente {
  produit: StockEnriched;
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

export const OPTIONS_PAIEMENT: DropdownOption[] = [
  {
    value: 'Espèces',
    label: 'Espèces (Cash)',
    sublabel: 'Règlement physique avec calcul de monnaie',
    badge: 'CASH',
    icon: React.createElement(Banknote, { size: 16 }),
  },
  {
    value: 'Wave',
    label: 'Wave Mobile Money',
    sublabel: 'Paiement sans frais par QR code / numéro',
    badge: 'WAVE',
    icon: React.createElement(Smartphone, { size: 16 }),
  },
  {
    value: 'Orange Money',
    label: 'Orange Money (OM)',
    sublabel: "Transfert d'argent mobile instantané",
    badge: 'OM',
    icon: React.createElement(Smartphone, { size: 16 }),
  },
  {
    value: 'Free Money',
    label: 'Free Money',
    sublabel: 'Portefeuille électronique Free Sénégal',
    badge: 'FREE',
    icon: React.createElement(Smartphone, { size: 16 }),
  },
  {
    value: 'Carte bancaire',
    label: 'Carte Bancaire / TPE',
    sublabel: 'Terminal bancaire Visa, Mastercard, GIM',
    badge: 'TPE',
    icon: React.createElement(CreditCard, { size: 16 }),
  },
  {
    value: 'Vente à crédit',
    label: 'Vente à crédit / Compte client',
    sublabel: 'Enregistrement en créance sur la fiche du client',
    badge: 'CRÉDIT',
    icon: React.createElement(FileText, { size: 16 }),
  },
];
