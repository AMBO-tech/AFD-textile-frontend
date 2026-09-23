import React from 'react';
import { Search, Building2, Warehouse } from 'lucide-react';


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
}) => {
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
          <div className="relative flex-1">
            <select
              value={filtreEmplacement}
              onChange={(e) => onEmplacementChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 bg-gray-50/50 focus:outline-none focus:border-blue-500"
            >
              <option value="tous">Tous les emplacements (Réseau)</option>
              <option value="entrepot">Entrepôt Central</option>
              {boutiques.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nom} ({b.lieu})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50/60 text-xs font-semibold text-blue-800">
            <Warehouse size={14} />
            <span>Stock Boutique Locale</span>
          </div>
        )}

        {/* Sélecteur de catégorie */}
        <div className="relative flex-1">
          <select
            value={filtreCat}
            onChange={(e) => onCatChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 bg-gray-50/50 focus:outline-none focus:border-blue-500"
          >
            <option value="toutes">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c.nom} value={c.nom}>
                {c.nom}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default StockFilters;
