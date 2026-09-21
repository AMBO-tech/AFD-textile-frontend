import React from 'react';
import { Plus, AlertTriangle, CheckCircle, Package, Store, Warehouse, ShoppingCart } from 'lucide-react';
import type { StockEnriched } from '../../data/useMockStore';
import { formatMontant } from '../../data/mock';

interface StockItemCardProps {
  produit: StockEnriched;
  onEntreeRapide: (produit: StockEnriched) => void;
  onVenteRapide?: (produitId: string) => void;
  nomEmplacement?: string;
  typeEmplacement?: 'boutique' | 'entrepot';
  role?: 'gerant' | 'boutiquier';
}

export const StockItemCard: React.FC<StockItemCardProps> = ({
  produit,
  onEntreeRapide,
  onVenteRapide,
  nomEmplacement,
  typeEmplacement = 'boutique',
  role = 'gerant',
}) => {
  const isCritique = produit.quantite <= produit.seuil;
  const isRupture = produit.quantite === 0;

  return (
    <div className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm flex items-center justify-between gap-3 hover:border-blue-100 transition-all">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
          <img
            src={produit.photo}
            alt={produit.nom}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-gray-900 text-sm truncate">{produit.nom}</div>
          <div className="text-xs text-gray-500 mt-0.5">
            {produit.couleur} • <span className="font-medium text-gray-700">{formatMontant(produit.prix)}</span>/{produit.unite}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap mt-1">
            {nomEmplacement && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                  typeEmplacement === 'entrepot'
                    ? 'bg-amber-50 text-amber-800 border-amber-200/70'
                    : 'bg-blue-50 text-blue-800 border-blue-200/70'
                }`}
                title={`Stock physique situé à : ${nomEmplacement}`}
              >
                {typeEmplacement === 'entrepot' ? (
                  <Warehouse size={10} className="text-amber-600" />
                ) : (
                  <Store size={10} className="text-blue-600" />
                )}
                {nomEmplacement}
              </span>
            )}
            {isRupture ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                <AlertTriangle size={10} />
                Rupture
              </span>
            ) : isCritique ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                <AlertTriangle size={10} />
                Faible ({produit.quantite} {produit.unite})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700">
                <CheckCircle size={10} />
                En stock ({produit.quantite} {produit.unite})
              </span>
            )}
            <span className="text-[10px] text-gray-400">Seuil: {produit.seuil}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        {role === 'gerant' ? (
          <button
            onClick={() => onEntreeRapide(produit)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors"
            title="Ajuster le stock physique"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Ajuster</span>
          </button>
        ) : produit.quantite > 0 && onVenteRapide ? (
          <button
            onClick={() => onVenteRapide(produit.id)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-colors"
            title="Vendre à la caisse"
          >
            <ShoppingCart size={13} />
            <span className="hidden sm:inline">Vendre</span>
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default StockItemCard;
