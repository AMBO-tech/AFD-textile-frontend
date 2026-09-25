import type { LocationType } from '@/types/enums';

export const TYPES_EMPLACEMENT: { id: LocationType; label: string; aide: string }[] = [
  { id: 'BOUTIQUE', label: 'Boutique', aide: 'Point de vente : ses boutiquiers y vendent et demandent du stock.' },
  { id: 'ENTREPOT', label: 'Entrepôt', aide: 'Réserve : reçoit les arrivages et approvisionne les boutiques par transfert.' },
];
