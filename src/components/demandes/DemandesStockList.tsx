import React from 'react';
import { Package, Send } from 'lucide-react';
import type { Produit } from '../../data/useMockStore';

interface DemandesStockListProps {
  stocks: Produit[];
  onOpenDemande: (produit: Produit) => void;
}

export const DemandesStockList: React.FC<DemandesStockListProps> = ({
  stocks,
  onOpenDemande,
}) => {
  if (stocks.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center text-gray-400 shadow-sm border border-gray-100">
        <Package size={32} className="mx-auto mb-2 opacity-30" />
        <p className="text-sm">Aucun tissu trouvé</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {stocks.map((p) => {
        const critique = p.quantite <= p.seuil;

        return (
          <div
            key={p.id}
            className={`bg-white rounded-2xl p-3.5 shadow-sm border transition-all flex items-center justify-between gap-3 ${
              critique ? 'border-red-100' : 'border-gray-100'
            }`}
          >
            {/* Photo & infos */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 flex items-center justify-center border border-gray-100">
                {p.photo ? (
                  <img src={p.photo} alt={p.nom} className="w-full h-full object-cover" />
                ) : (
                  <Package size={18} className="text-gray-400" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-gray-900 text-sm truncate">{p.nom}</span>
                  {critique && (
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-md">
                      Critique
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {p.categorie} {p.couleur ? `· ${p.couleur}` : ''}
                </div>
              </div>
            </div>

            {/* Quantité restante */}
            <div className="text-right flex-shrink-0">
              <div className={`font-bold text-sm ${critique ? 'text-red-600' : 'text-gray-900'}`}>
                {p.quantite} {p.unite}
              </div>
              <div className="text-[11px] text-gray-400">
                seuil : {p.seuil}
              </div>
            </div>

            {/* Bouton Demander */}
            <button
              onClick={() => onOpenDemande(p)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white shadow-sm active:scale-95 transition-all flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
            >
              <Send size={12} />
              <span>Demander</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default DemandesStockList;
