import React from 'react';
import { Package, Edit2, Trash2 } from 'lucide-react';
import type { Produit } from '../../data/useMockStore';

export interface ProductCardProps {
  product: Produit;
  role?: 'gerant' | 'boutiquier';
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  role = 'gerant',
  onClick,
  onEdit,
  onDelete,
}) => {
  const isRupture = product.quantite !== undefined && product.quantite <= 0;
  const isCritique = product.quantite !== undefined && product.seuil !== undefined && product.quantite > 0 && product.quantite <= product.seuil;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all active:scale-95 group flex flex-col h-full"
    >
      {/* Zone image */}
      <div className="relative w-full overflow-hidden shrink-0" style={{ aspectRatio: '4/3', background: '#F8F8F6' }}>
        {product.photo ? (
          <img
            src={product.photo}
            alt={product.nom}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={36} color={isCritique || isRupture ? '#EF4444' : '#1E88E5'} />
          </div>
        )}
        {isRupture ? (
          <span className="absolute top-2 left-2 text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full shadow-xs">
            Rupture
          </span>
        ) : isCritique ? (
          <span className="absolute top-2 left-2 text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-xs">
            Critique
          </span>
        ) : null}
        {role === 'gerant' && onEdit && onDelete && (
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
      <div className="px-3 py-2.5 border-t border-gray-50 text-center flex-1 flex flex-col justify-between">
        <div>
          <div className="font-display font-bold text-gray-800 text-sm leading-tight truncate">
            {product.nom}
          </div>
          {product.reference && (
            <div className="text-[11px] font-mono text-blue-600 font-semibold mt-0.5 truncate">
              {product.reference}
            </div>
          )}
          <div className="text-xs text-gray-500 mt-0.5 truncate">
            {product.couleur || product.motif || product.categorie}
          </div>
        </div>
        <div className="mt-1">
          {product.quantite !== undefined && (
            <div className="text-[11px] text-gray-500 truncate">
              Stock :{' '}
              <span
                className={`font-semibold ${
                  product.quantite <= 0 ? 'text-red-500' : 'text-gray-700'
                }`}
              >
                {product.quantite} {product.unite || 'm'}
              </span>
            </div>
          )}
          {product.prix ? (
            <div className="text-xs font-bold mt-0.5" style={{ color: '#0F3D5E' }}>
              {product.prix.toLocaleString()} FCFA
              {product.unite ? (
                <span className="text-[10px] text-gray-400 font-normal">
                  {' '}
                  / {product.unite}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
