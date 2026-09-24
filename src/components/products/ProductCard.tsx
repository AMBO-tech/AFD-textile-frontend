import React from 'react';
import { Package, Edit2, Trash2 } from 'lucide-react';


interface ProductCardProps {
  product: Produit;
  role?: 'gerant' | 'boutiquier';
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  role = 'gerant',
  onClick,
  onEdit,
  onDelete,
}) => {
  const isCritique = product.quantite <= product.seuil;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all active:scale-95"
    >
      {/* Zone image */}
      <div className="relative w-full" style={{ aspectRatio: '4/3', background: '#F8F8F6' }}>
        {product.photo ? (
          <img src={product.photo} alt={product.nom} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={36} color={isCritique ? '#EF4444' : '#1E88E5'} />
          </div>
        )}
        {isCritique && (
          <span className="absolute top-2 left-2 text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
            Critique
          </span>
        )}
        {role === 'gerant' && (
          <div
            className="absolute top-2 right-2 flex gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onEdit}
              className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center text-blue-500 shadow-sm hover:bg-white"
            >
              <Edit2 size={12} />
            </button>
            <button
              onClick={onDelete}
              className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center text-red-400 shadow-sm hover:bg-white"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
      {/* Zone texte sous l'image */}
      <div className="px-3 py-2.5 border-t border-gray-50 text-center">
        <div className="font-display font-bold text-gray-800 text-base leading-tight truncate">
          {product.nom}
        </div>
        <div className="text-sm font-bold mt-0.5" style={{ color: '#0F3D5E' }}>
          {product.prix.toLocaleString()} FCFA
        </div>
        <div className="text-xs text-gray-400 mt-0.5">
          {product.quantite} {product.unite}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
