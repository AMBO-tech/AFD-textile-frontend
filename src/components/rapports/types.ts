export type Periode = 'jour' | 'semaine' | 'mois' | 'annee';

export interface PeriodeOption {
  id: Periode;
  label: string;
}

export interface KpiItem {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
  color: string;
  bg: string;
  delta: string;
}
