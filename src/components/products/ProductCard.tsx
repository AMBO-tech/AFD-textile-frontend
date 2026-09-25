import React, { useState } from 'react';
import { Package, Pencil, Archive } from 'lucide-react';
import type { Produit } from '@/types/products';
import { formatMontant } from '@/utils/format';
import { LIBELLE_UNITE_STOCKAGE } from './types';

interface ProductCardProps {
  produit: Produit;
  gerant: boolean;
  onEdit: () => void;
  onArchive: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ produit, gerant, onEdit, onArchive }) => {
  const [photoCassee, setPhotoCassee] = useState(false);
  const archive = produit.statut === 'INACTIF';
  const unite = LIBELLE_UNITE_STOCKAGE[produit.uniteStockage];

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden flex flex-col ${archive ? 'opacity-60' : ''}`}>
      <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center">
        {produit.photoUrl && !photoCassee ? (
          <img src={produit.photoUrl} alt={produit.nom} onError={() => setPhotoCassee(true)} className="w-full h-full object-cover" />
        ) : (
          <Package size={28} className="text-gray-300" />
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col gap-1">
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{produit.reference}</div>
        <div className="font-semibold text-gray-900 text-sm leading-tight">{produit.nom}</div>
        <div className="text-[11px] text-gray-500">
          {produit.categorie?.nom}
          {produit.couleur ? ` • ${produit.couleur}` : ''}
        </div>
        <div className="mt-auto pt-1 text-xs">
          <span className="font-bold text-gray-900">{formatMontant(produit.prixIndicatif)}</span>
          <span className="text-gray-400"> / {unite}</span>
          {produit.prixMinimum != null && (
            <div className="text-[10px] text-gray-400">min. {formatMontant(produit.prixMinimum)}</div>
          )}
          {produit.uniteStockage === 'ROULEAU' && produit.longueurRouleauMetres != null && (
            <div className="text-[10px] text-gray-400">{produit.longueurRouleauMetres} m par rouleau</div>
          )}
        </div>
        {archive && <span className="self-start text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Archivé</span>}
      </div>
      {gerant && !archive && (
        <div className="grid grid-cols-2 border-t border-gray-100 text-[11px] font-semibold">
          <button onClick={onEdit} className="flex items-center justify-center gap-1 py-2 text-blue-700 hover:bg-blue-50">
            <Pencil size={12} /> Modifier
          </button>
          <button onClick={onArchive} className="flex items-center justify-center gap-1 py-2 text-rose-600 hover:bg-rose-50 border-l border-gray-100">
            <Archive size={12} /> Archiver
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
