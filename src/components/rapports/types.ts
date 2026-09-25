import type { PeriodeRapport } from '@/services/reports.service';

export const PERIODES: { id: PeriodeRapport; label: string }[] = [
  { id: 'AUJOURDHUI', label: 'Aujourd’hui' },
  { id: 'HIER', label: 'Hier' },
  { id: 'CETTE_SEMAINE', label: 'Cette semaine' },
  { id: 'CE_MOIS', label: 'Ce mois' },
  { id: 'CE_TRIMESTRE', label: 'Ce trimestre' },
  { id: 'CETTE_ANNEE', label: 'Cette année' },
  { id: 'PERSONNALISE', label: 'Personnalisée' },
];

export const libellePeriode = (id: PeriodeRapport) => PERIODES.find((p) => p.id === id)?.label ?? id;

export const pourcent = (v: number | null | undefined) =>
  `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(v ?? 0)} %`;

export const nombre = (v: number | null | undefined) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(v ?? 0);

/** Carte de section du rapport (titre, sous-titre, contenu). */
export const CARTE = 'bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs break-inside-avoid';
