import React, { useState } from 'react';
import { Search, Package, Check } from 'lucide-react';
import type { StockEnriched } from '../../data/useMockStore';

interface EntrepotStockListProps {
  produits: StockEnriched[];
  produitSelectionne: StockEnriched | null;
  onSelectProduit: (p: StockEnriched) => void;
}

export const EntrepotStockList: React.FC<EntrepotStockListProps> = ({
  produits,
  produitSelectionne,
  onSelectProduit,
}) => {
  const [search, setSearch] = useState('');

  const dispo = produits.filter(
    (p) =>
      p.quantite > 0 &&
      (p.nom.toLowerCase().includes(search.toLowerCase()) ||
        p.categorie.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="font-display font-bold text-gray-900 text-base">
          2. Articles Disponibles à l'Origine ({dispo.length})
        </div>
        <div className="relative w-full sm:w-60">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrer les tissus..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
        {dispo.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-xs text-gray-400">
            Aucun stock disponible à cet emplacement.
          </div>
        ) : (
          dispo.map((prod) => {
            const isSelected = produitSelectionne?.id === prod.id;

            return (
              <div
                key={prod.id}
                onClick={() => onSelectProduit(prod)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/40 shadow-xs'
                    : 'border-gray-100 bg-gray-50/50 hover:bg-white hover:border-blue-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-white flex-shrink-0 border border-gray-200">
                    <img src={prod.photo} alt={prod.nom} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 text-xs truncate">{prod.nom}</div>
                    <div className="text-[11px] text-gray-500">{prod.categorie} • {prod.couleur}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right">
                    <div className="font-bold text-xs text-blue-700">
                      {prod.quantite} {prod.unite}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Check size={12} />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EntrepotStockList;
