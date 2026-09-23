import React from 'react';
import { Plus, AlertTriangle, CheckCircle, Package } from 'lucide-react';



interface StockItemCardProps {
  produit: Produit;
  onEntreeRapide: (produit: Produit) => void;
  onVenteRapide?: (produitId: string) => void;
}

export const StockItemCard: React.FC<StockItemCardProps> = ({
  produit,
  onEntreeRapide,
  onVenteRapide,
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
          <div className="flex items-center gap-1.5 mt-1">
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
        <button
          onClick={() => onEntreeRapide(produit)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors"
          title="Ajouter du stock"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">Entrée</span>
        </button>
      </div>
    </div>
  );
};

export default StockItemCard;
