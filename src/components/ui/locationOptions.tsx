import { Store, Warehouse } from 'lucide-react';
import type { Location } from '@/types/locations';
import type { SelectOption } from './SelectField';

/** Options de liste déroulante pour des emplacements : icône entrepôt / boutique et adresse. */
export const optionsEmplacements = (emplacements: Location[], exclure?: string): SelectOption[] =>
  emplacements
    .filter((l) => l.id !== exclure)
    .sort((a, b) => a.type.localeCompare(b.type) || a.nom.localeCompare(b.nom))
    .map((l) => ({
      value: l.id,
      label: l.nom,
      description: [l.type === 'ENTREPOT' ? 'Entrepôt' : 'Boutique', l.adresse].filter(Boolean).join(' • '),
      icon: l.type === 'ENTREPOT' ? <Warehouse size={16} /> : <Store size={16} />,
    }));
