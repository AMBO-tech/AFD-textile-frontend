import { formatMontant } from '@/utils/format';
import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import type { Vente } from '../../types/sales';
import { MOTIFS_ANNULATION } from './types';
import SelectField from '../ui/SelectField';

interface SalesCancelModalProps {
  vente: Vente | null;
  onClose: () => void;
  /** Ferme la fenêtre elle-même en cas de succès ; la laisse ouverte en cas d'échec. */
  onConfirmCancel: (venteId: string, motif: string) => Promise<void>;
}

export const SalesCancelModal: React.FC<SalesCancelModalProps> = ({
  vente,
  onClose,
  onConfirmCancel,
}) => {
  const [motif, setMotif] = useState<string>(MOTIFS_ANNULATION[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!vente) return null;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // évite la double annulation (double clic)
    setIsSubmitting(true);
    try {
      await onConfirmCancel(vente.id, motif);
    } finally {
      setIsSubmitting(false);
    }
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
              Annuler la vente {vente.referenceFacture}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={18} />
          </button>
        </div>

        <div className="p-3 rounded-xl bg-red-50/50 border border-red-100 mb-4 space-y-1 text-xs text-red-900">
          <div>
            Articles :{' '}
            <span className="font-bold">
              {vente.lignes.map((l) => `${l.produitNom} (${l.quantite} ${l.uniteSaisie.toLowerCase()})`).join(', ')}
            </span>
          </div>
          <div>
            Montant : <span className="font-bold">{formatMontant(vente.montantTotal)}</span>
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
            <SelectField value={motif} onChange={setMotif} options={MOTIFS_ANNULATION.map((m) => ({ value: m, label: m }))} aria-label="Motif" />
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
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-all disabled:opacity-60"
            >
              {isSubmitting ? 'Annulation…' : "Confirmer l'annulation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalesCancelModal;
