import React from 'react';
import type { Demande } from '../../data/useMockStore';

interface DemandeValidationModalProps {
  validation: { demande: Demande; action: 'acceptee' | 'refusee' } | null;
  qteModif: string;
  onQteModifChange: (val: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export const DemandeValidationModal: React.FC<DemandeValidationModalProps> = ({
  validation,
  qteModif,
  onQteModifChange,
  onClose,
  onConfirm,
}) => {
  if (!validation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl w-full max-w-xs shadow-2xl p-5 animate-scale-up">
        <h2 className="font-display font-bold text-gray-900 text-base mb-1">
          {validation.action === 'acceptee' ? 'Valider la demande' : 'Refuser la demande'}
        </h2>
        <p className="text-xs text-gray-500 mb-3">{validation.demande.produit}</p>
        {validation.action === 'acceptee' && (
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Quantité</label>
            <input
              type="number"
              value={qteModif}
              onChange={(e) => onQteModifChange(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm font-bold focus:outline-none"
            />
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-gray-100 text-xs font-medium text-gray-600"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-xl text-white font-semibold text-xs shadow-sm"
            style={{ background: validation.action === 'acceptee' ? '#22C55E' : '#EF4444' }}
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemandeValidationModal;
