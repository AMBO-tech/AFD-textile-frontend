import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';


import { MOTIFS_ANNULATION } from './types';

interface SalesCancelModalProps {
  vente: Vente | null;
  onClose: () => void;
  onConfirmCancel: (venteId: string, motif: string) => void;
}

export const SalesCancelModal: React.FC<SalesCancelModalProps> = ({
  vente,
  onClose,
  onConfirmCancel,
}) => {
  const [motif, setMotif] = useState<string>(MOTIFS_ANNULATION[0]);

  if (!vente) return null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmCancel(vente.id, motif);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <AlertCircle size={18} />
            </div>
            <div className="font-display font-bold text-gray-900 text-base">
              Annuler la Vente #{vente.id}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={18} />
          </button>
        </div>

        <div className="p-3 rounded-xl bg-red-50/50 border border-red-100 mb-4 space-y-1 text-xs text-red-900">
          <div>
            Article : <span className="font-bold">{vente.produit}</span> ({vente.quantite} {vente.unite})
          </div>
          <div>
            Montant : <span className="font-bold">{formatMontant(vente.montant)}</span>
          </div>
          <p className="text-[11px] text-red-600 pt-1">
            Le stock vendu sera automatiquement réintégré dans l'inventaire boutique.
          </p>
        </div>

        <form onSubmit={handleConfirm} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Motif de l'annulation *
            </label>
            <select
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-red-500"
            >
              {MOTIFS_ANNULATION.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Retour
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-all"
            >
              Confirmer l'annulation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalesCancelModal;
