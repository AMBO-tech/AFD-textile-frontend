import React, { useState } from 'react';
import { X, Plus, Package } from 'lucide-react';
import type { Produit } from '../../data/useMockStore';

interface QuickStockAdjustmentModalProps {
  produit: Produit | null;
  onClose: () => void;
  onSubmit: (produitId: string, quantiteAjout: number, motif: string) => void;
}

export const QuickStockAdjustmentModal: React.FC<QuickStockAdjustmentModalProps> = ({
  produit,
  onClose,
  onSubmit,
}) => {
  const [quantite, setQuantite] = useState('10');
  const [motif, setMotif] = useState('Réassort boutique');

  if (!produit) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qteNum = parseFloat(quantite);
    if (isNaN(qteNum) || qteNum <= 0) return;

    onSubmit(produit.id, qteNum, motif);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
          <div className="font-display font-bold text-gray-900 text-base">
            Entrée Rapide de Stock
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={18} />
          </button>
        </div>

        {/* Aperçu produit */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 mb-4">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white flex-shrink-0 border border-gray-200">
            <img src={produit.photo} alt={produit.nom} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 text-sm truncate">{produit.nom}</div>
            <div className="text-xs text-gray-500">
              Stock actuel : <span className="font-bold text-blue-600">{produit.quantite} {produit.unite}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Quantité à ajouter ({produit.unite}) *
            </label>
            <input
              type="number"
              min="0.1"
              step="any"
              required
              value={quantite}
              onChange={(e) => setQuantite(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Motif de l'entrée
            </label>
            <select
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="Réassort boutique">Réassort boutique</option>
              <option value="Arrivage fournisseur">Arrivage fournisseur</option>
              <option value="Retour client">Retour client</option>
              <option value="Correction inventaire">Correction d'inventaire</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-sm hover:opacity-95 transition-all"
              style={{ background: '#0F3D5E' }}
            >
              Valider l'entrée
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickStockAdjustmentModal;
