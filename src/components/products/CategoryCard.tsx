import React from 'react';
import { Package } from 'lucide-react';

interface CategoryCardProps {
  nom: string;
  photo?: string;
  productCount: number;
  onClick: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  nom,
  photo,
  productCount,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 text-left hover:shadow-md hover:border-blue-200 transition-all active:scale-95"
    >
      {/* Zone image */}
      <div className="w-full" style={{ aspectRatio: '4/3', background: '#F8F8F6' }}>
        {photo ? (
          <img src={photo} alt={nom} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={36} color="#1E88E5" />
          </div>
        )}
      </div>
      {/* Zone texte centrée sous l'image */}
      <div className="px-3 py-2.5 border-t border-gray-50 text-center">
        <div className="font-display font-bold text-gray-800 text-base leading-tight">
          {nom}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">
          {productCount} produit{productCount !== 1 ? 's' : ''}
        </div>
      </div>
    </button>
  );
};

export default CategoryCard;
