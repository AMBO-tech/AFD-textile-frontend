import React from 'react';
import { Search } from 'lucide-react';


interface ClientFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  /** Filtre boutique facultatif (les fiches clients sont communes au réseau). */
  filtreBoutique?: string;
  onBoutiqueChange?: (v: string) => void;
  filtreSolde: 'tous' | 'creance' | 'a_jour';
  onSoldeChange: (v: 'tous' | 'creance' | 'a_jour') => void;
  boutiques?: Boutique[];
  role: 'gerant' | 'boutiquier';
}

export const ClientFilters: React.FC<ClientFiltersProps> = ({
  search,
  onSearchChange,
  filtreBoutique,
  onBoutiqueChange,
  filtreSolde,
  onSoldeChange,
  boutiques = [],
  role,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-5 space-y-3">
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher par nom, téléphone, quartier..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Filtre statut de créance */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl flex-1">
          <button
            type="button"
            onClick={() => onSoldeChange('tous')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filtreSolde === 'tous' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Tous
          </button>
          <button
            type="button"
            onClick={() => onSoldeChange('creance')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filtreSolde === 'creance' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Avec créance
          </button>
          <button
            type="button"
            onClick={() => onSoldeChange('a_jour')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filtreSolde === 'a_jour' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            À jour
          </button>
        </div>

        {/* Filtre boutique si gérant */}
        {role === 'gerant' && boutiques.length > 0 && onBoutiqueChange && (
          <div className="flex-1">
            <select
              value={filtreBoutique}
              onChange={(e) => onBoutiqueChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 bg-gray-50/50 focus:outline-none focus:border-blue-500"
            >
              <option value="toutes">Toutes les boutiques</option>
              {boutiques.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nom}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientFilters;
