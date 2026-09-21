import React from 'react';
import { Search, Plus } from 'lucide-react';
import type { Produit } from '../../../data/useMockStore';

interface StockInProductsStepProps {
  searchProd: string;
  onSearchChange: (val: string) => void;
  onOpenNewProd?: () => void;
  prodsFiltres: Produit[];
  onSelectProd: (prod: Produit) => void;
  formatMontant: (n: number) => string;
}

export const StockInProductsStep: React.FC<StockInProductsStepProps> = ({
  searchProd,
  onSearchChange,
  onOpenNewProd,
  prodsFiltres,
  onSelectProd,
  formatMontant,
}) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchProd}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filtrer les modèles..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          type="button"
          onClick={onOpenNewProd}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors flex-shrink-0 cursor-pointer"
        >
          <Plus size={14} />
          Nouveau Modèle
        </button>
      </div>

      <div className="space-y-2">
        {prodsFiltres.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-400">
            Aucun modèle trouvé. Créez-en un avec le bouton ci-dessus.
          </div>
        ) : (
          prodsFiltres.map((prod) => (
            <button
              key={prod.id}
              onClick={() => onSelectProd(prod)}
              className="w-full p-2.5 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 flex items-center justify-between text-left transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img src={prod.photo} alt={prod.nom} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-xs">{prod.nom}</div>
                  <div className="text-[11px] text-gray-500">{prod.couleur}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900 text-xs">
                  {prod.prix ? formatMontant(prod.prix) : 'Prix à fixer'}
                </div>
                <div className="text-[10px] text-gray-400">
                  {prod.unite ? `par ${prod.unite}` : 'au choix'}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default StockInProductsStep;
