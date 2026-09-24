import React, { useState } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, AlertTriangle } from 'lucide-react';


interface QuickStockAdjustmentModalProps {
  produit: StockEnriched | null;
  onClose: () => void;
  onSubmit: (produitId: string, quantiteChange: number, motif: string) => void;
}

export const QuickStockAdjustmentModal: React.FC<QuickStockAdjustmentModalProps> = ({
  produit,
  onClose,
  onSubmit,
}) => {
  const [typeAjustement, setTypeAjustement] = useState<'entree' | 'sortie'>('entree');
  const [quantite, setQuantite] = useState('10');
  const [motif, setMotif] = useState('Réassort boutique');

  if (!produit) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qteNum = parseFloat(quantite);
    if (isNaN(qteNum) || qteNum <= 0) return;

    const qteFinale = typeAjustement === 'entree' ? qteNum : -qteNum;
    onSubmit(produit.id, qteFinale, motif);
    onClose();
  };

  const handleTypeChange = (nouveauType: 'entree' | 'sortie') => {
    setTypeAjustement(nouveauType);
    if (nouveauType === 'entree') {
      setMotif('Réassort boutique');
    } else {
      setMotif('Perte / Casse');
    }
  };

  const isSortieExcessive = typeAjustement === 'sortie' && parseFloat(quantite) > produit.quantite;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
          <div className="font-display font-bold text-gray-900 text-base">
            Ajustement Rapide de Stock
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={18} />
          </button>
        </div>

        {/* Aperçu produit */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 mb-3.5">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white flex-shrink-0 border border-gray-200">
            <img src={produit.photo} alt={produit.nom} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 text-sm truncate">{produit.nom}</div>
            <div className="text-xs text-gray-500">
              Stock physique : <span className="font-bold text-blue-600">{produit.quantite} {produit.unite}</span>
            </div>
          </div>
        </div>

        {/* Sélecteur Type : Entrée vs Perte/Sortie */}
        <div className="grid grid-cols-2 gap-2 mb-3.5 p-1 bg-gray-100 rounded-xl">
          <button
            type="button"
            onClick={() => handleTypeChange('entree')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              typeAjustement === 'entree'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <ArrowDownLeft size={14} className={typeAjustement === 'entree' ? 'text-emerald-600' : 'text-gray-400'} />
            Entrée (+)
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('sortie')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              typeAjustement === 'sortie'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <ArrowUpRight size={14} className={typeAjustement === 'sortie' ? 'text-rose-600' : 'text-gray-400'} />
            Perte / Sortie (-)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {typeAjustement === 'entree' ? 'Quantité à ajouter' : 'Quantité à déduire'} ({produit.unite}) *
            </label>
            <input
              type="number"
              min="0.1"
              max={typeAjustement === 'sortie' ? produit.quantite : undefined}
              step="any"
              required
              value={quantite}
              onChange={(e) => setQuantite(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-sm font-bold text-gray-900 focus:outline-none ${
                isSortieExcessive ? 'border-rose-400 bg-rose-50/50' : 'border-gray-200 focus:border-blue-500'
              }`}
            />
            {isSortieExcessive && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertTriangle size={12} />
                La quantité dépasse le stock disponible ({produit.quantite} {produit.unite})
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Motif de l'opération *
            </label>
            <select
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500"
            >
              {typeAjustement === 'entree' ? (
                <>
                  <option value="Réassort boutique">Réassort boutique</option>
                  <option value="Arrivage fournisseur">Arrivage fournisseur</option>
                  <option value="Retour client">Retour client</option>
                  <option value="Correction inventaire (+)">Correction inventaire (+)</option>
                </>
              ) : (
                <>
                  <option value="Perte / Casse">Perte / Casse</option>
                  <option value="Tissu détérioré / taché">Tissu détérioré / taché</option>
                  <option value="Correction inventaire (-)">Correction inventaire (-)</option>
                  <option value="Échantillonnage client">Échantillonnage client</option>
                </>
              )}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSortieExcessive}
              className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow-sm hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
              style={{ background: typeAjustement === 'entree' ? '#0F3D5E' : '#DC2626' }}
            >
              {typeAjustement === 'entree' ? 'Valider l\'entrée (+)' : 'Valider la déduction (-)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickStockAdjustmentModal;
