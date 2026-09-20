import React from 'react';
import { Search, Building2, Warehouse, Store, Tag, Layers } from 'lucide-react';
import type { Boutique } from '../../data/useMockStore';
import CustomDropdownSelect, { type DropdownOption } from '../ui/CustomDropdownSelect';

interface StockFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  filtreEmplacement: string;
  onEmplacementChange: (v: string) => void;
  filtreCat: string;
  onCatChange: (v: string) => void;
  categories: { nom: string }[];
  boutiques: Boutique[];
  role: 'gerant' | 'boutiquier';
  boutiqueId?: string;
}

export const StockFilters: React.FC<StockFiltersProps> = ({
  search,
  onSearchChange,
  filtreEmplacement,
  onEmplacementChange,
  filtreCat,
  onCatChange,
  categories,
  boutiques,
  role,
  boutiqueId,
}) => {
  const optionsEmplacement: DropdownOption[] = [
    {
      value: 'tous',
      label: 'Toutes les boutiques (Réseau)',
      sublabel: 'Vue consolidée multi-boutiques',
      badge: 'GLOBAL',
      icon: <Building2 size={16} />,
    },
    {
      value: 'entrepot',
      label: 'Entrepôt Central',
      sublabel: 'Dakar - Zone Industrielle',
      badge: 'HUB',
      icon: <Warehouse size={16} />,
    },
    ...boutiques.map((b) => ({
      value: b.id,
      label: b.nom,
      sublabel: b.lieu,
      badge: b.code || undefined,
      icon: <Store size={16} />,
    })),
  ];

  const optionsCat: DropdownOption[] = [
    {
      value: 'toutes',
      label: 'Toutes les catégories',
      sublabel: 'Afficher tous les tissus',
      badge: `${categories.length}`,
      icon: <Layers size={16} />,
    },
    ...categories.map((c) => ({
      value: c.nom,
      label: c.nom,
      sublabel: 'Catégorie de tissu',
      icon: <Tag size={16} />,
    })),
  ];

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-5 space-y-3">
      {/* Barre de recherche */}
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher un tissu, couleur, catégorie..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Sélecteur d'emplacement */}
        {role === 'gerant' ? (
          <div className="flex-1">
            <CustomDropdownSelect
              label="Point de stockage"
              menuTitle="Changer d'emplacement"
              value={filtreEmplacement}
              onChange={onEmplacementChange}
              options={optionsEmplacement}
              icon={<Store size={16} />}
            />
          </div>
        ) : (
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-blue-50/80 border border-blue-100 text-xs font-semibold text-blue-900 flex-1">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Store size={16} />
            </div>
            <div className="truncate">
              <span className="text-[10px] uppercase font-bold text-blue-600 block leading-tight">Point de vente local</span>
              <span className="font-bold text-gray-900 text-xs truncate block">
                {boutiques.find((b) => b.id === boutiqueId)?.nom || 'Boutique Locale'}
              </span>
            </div>
          </div>
        )}

        {/* Sélecteur de catégorie */}
        <div className="flex-1">
          <CustomDropdownSelect
            label="Catégorie"
            menuTitle="Filtrer par catégorie"
            value={filtreCat}
            onChange={onCatChange}
            options={optionsCat}
            icon={<Layers size={16} />}
          />
        </div>
      </div>
    </div>
  );
};

export default StockFilters;
