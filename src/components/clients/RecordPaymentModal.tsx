import React, { useState } from 'react';
import { X, CreditCard } from 'lucide-react';


import { MODES_PAIEMENT } from './types';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientDetailed;
  creance: Creance | null;
  onSubmit: (montant: number, mode: string) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  client,
  creance,
  onSubmit,
}) => {
  if (!isOpen || !creance) return null;

  const totalPaye = creance.paiements.reduce((s: any, p: any) => s + p.montant, 0);
  const resteDu = Math.max(0, creance.montantTotal - totalPaye);

  const [montant, setMontant] = useState(resteDu.toString());
  const [mode, setMode] = useState<string>('Espèces');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const m = parseFloat(montant);
    if (isNaN(m) || m <= 0) return;

    onSubmit(m, mode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <CreditCard size={18} />
            </div>
            <div className="font-display font-bold text-gray-900 text-base">
              Règlement de Créance
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={18} />
          </button>
        </div>

        {/* Détails créance */}
        <div className="p-3 rounded-xl bg-gray-50 mb-4 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">Client :</span>
            <span className="font-semibold text-gray-900">{client.nom}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Total dossier :</span>
            <span className="font-semibold text-gray-900">{formatMontant(creance.montantTotal)}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-gray-200">
            <span className="font-bold text-red-600">Reste à payer :</span>
            <span className="font-bold text-red-600">{formatMontant(resteDu)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Montant versé (FCFA) *
            </label>
            <input
              type="number"
              min="100"
              max={resteDu}
              required
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Mode de règlement *
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500"
            >
              {MODES_PAIEMENT.map((m) => (
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
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-sm hover:opacity-95"
              style={{ background: '#16A34A' }}
            >
              Encaisser le règlement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordPaymentModal;
