import React from 'react';
import { Search } from 'lucide-react';
import { type StockEnriched } from '../../../types/stocks';
import DemandesStockList from '../../../components/demandes/DemandesStockList';

const CATEGORIES_DATA: any[] = [];

interface DemandesStockTabProps {
  search: string;
  onSearchChange: (val: string) => void;
  filtreCat: string;
  onFiltreCatChange: (val: string) => void;
  stocks: StockEnriched[];
  onOpenDemande: (p?: StockEnriched) => void;
  role: 'gerant' | 'boutiquier';
}

export const DemandesStockTab: React.FC<DemandesStockTabProps> = ({
  search,
  onSearchChange,
  filtreCat,
  onFiltreCatChange,
  stocks,
  onOpenDemande,
  role,
}) => {
  return (
    <div className="space-y-3">
      {/* Recherche */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher un tissu…"
          className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 shadow-sm"
        />
      </div>

      {/* Filtres catégories */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
        <button
          onClick={() => onFiltreCatChange('toutes')}
          className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
            filtreCat === 'toutes'
              ? 'text-white shadow-sm'
              : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
          }`}
          style={filtreCat === 'toutes' ? { background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' } : {}}
        >
          Toutes
        </button>
        {CATEGORIES_DATA.map((c: any) => {
          const active = filtreCat === c.nom;
          return (
            <button
              key={c.nom}
              onClick={() => onFiltreCatChange(c.nom)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                active
                  ? 'text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
              }`}
              style={active ? { background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' } : {}}
            >
              {c.nom}
            </button>
          );
        })}
      </div>

      {/* Liste épurée des stocks */}
      <DemandesStockList
        stocks={stocks}
        onOpenDemande={onOpenDemande}
      />
    </div>
  );
};

export default DemandesStockTab;
