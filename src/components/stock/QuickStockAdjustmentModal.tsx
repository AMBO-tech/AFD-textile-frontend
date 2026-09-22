import React, { useState } from 'react';
import { X, ArrowDownLeft, Store, Warehouse, Plus } from 'lucide-react';
import type { StockEnriched, Boutique } from '../../data/useMockStore';

interface QuickStockAdjustmentModalProps {
  produit: StockEnriched | null;
  boutiques?: Boutique[];
  onClose: () => void;
  onSubmit: (produitId: string, quantiteChange: number, motif: string) => void;
}

export const QuickStockAdjustmentModal: React.FC<QuickStockAdjustmentModalProps> = ({
  produit,
  boutiques = [],
  onClose,
  onSubmit,
}) => {
  const [quantite, setQuantite] = useState('10');

  if (!produit) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qteNum = parseFloat(quantite);
    if (isNaN(qteNum) || qteNum <= 0) return;

    onSubmit(produit.stockId || produit.id, qteNum, 'Entrée de stock');
    onClose();
  };

  const bId = produit.boutiqueId || produit.boutique;
  const isEntrepot = bId === 'entrepot' || bId === 'b-ent';
  const nomEmp = isEntrepot
    ? 'Entrepôt Central'
    : (boutiques?.find((b) => b.id === bId)?.nom || bId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl border border-gray-100 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ArrowDownLeft size={16} />
            </div>
            <div>
              <div className="font-display font-bold text-gray-900 text-sm">
                Entrée Rapide de Stock
              </div>
              <div className="text-[11px] text-gray-400">
                Ajustement positif de quantité
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* 1. Champ Produit (Aperçu contextuel) */}
        <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-white flex-shrink-0 border border-gray-200">
            <img src={produit.photo} alt={produit.nom} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-gray-900 text-xs truncate">{produit.nom}</div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              Stock actuel : <span className="font-bold text-blue-600">{produit.quantite} {produit.unite}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-500 mt-0.5">
              {isEntrepot ? (
                <Warehouse size={11} className="text-amber-600 shrink-0" />
              ) : (
                <Store size={11} className="text-blue-600 shrink-0" />
              )}
              <span className="truncate">{nomEmp}</span>
            </div>
          </div>
        </div>

        {/* 2. Champ Quantité + Bouton Valider */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Quantité à ajouter ({produit.unite}) *
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setQuantite((q) => String(Math.max(1, (parseFloat(q) || 0) - 5)))}
                className="w-11 h-11 flex items-center justify-center rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 font-bold text-lg text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                -
              </button>
              <input
                type="number"
                min="0.1"
                step="any"
                required
                value={quantite}
                onChange={(e) => setQuantite(e.target.value)}
                placeholder="10"
                className="w-full h-11 border border-gray-200 text-center font-bold text-base focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setQuantite((q) => String((parseFloat(q) || 0) + 5))}
                className="w-11 h-11 flex items-center justify-center rounded-r-xl border border-l-0 border-gray-200 bg-gray-50 font-bold text-lg text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-bold text-white rounded-xl shadow-sm hover:opacity-95 transition-all cursor-pointer"
              style={{ background: '#0F3D5E' }}
            >
              <Plus size={15} />
              <span>Valider l'entrée</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickStockAdjustmentModal;
