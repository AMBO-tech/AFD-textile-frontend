import React from 'react';
import { Plus } from 'lucide-react';
import type { Categorie } from '../../../data/useMockStore';

interface StockInCategoriesStepProps {
  categories: Categorie[];
  onSelectCat: (catNom: string) => void;
  onOpenNewCat?: () => void;
}

export const StockInCategoriesStep: React.FC<StockInCategoriesStepProps> = ({
  categories,
  onSelectCat,
  onOpenNewCat,
}) => {
  return (
    <div>
      <div className="flex justify-end mb-3">
        <button
          type="button"
          onClick={onOpenNewCat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
        >
          <Plus size={14} />
          Nouvelle Catégorie
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {categories.map((cat) => (
          <button
            key={cat.nom}
            onClick={() => onSelectCat(cat.nom)}
            className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-blue-50/50 hover:border-blue-200 transition-all flex flex-col items-center text-center group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-xl overflow-hidden mb-2 bg-gray-200">
              <img
                src={cat.photo}
                alt={cat.nom}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="font-semibold text-gray-800 text-xs">{cat.nom}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StockInCategoriesStep;
