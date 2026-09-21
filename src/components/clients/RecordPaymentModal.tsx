import React, { useState, useEffect } from 'react';
import { X, CreditCard, Banknote, Smartphone } from 'lucide-react';
import type { ClientDetailed, Creance } from '../../data/useMockStore';
import { formatMontant } from '../../data/mock';
import CustomDropdownSelect, { type DropdownOption } from '../ui/CustomDropdownSelect';

const OPTIONS_PAIEMENT: DropdownOption[] = [
  {
    value: 'Espèces',
    label: 'Espèces (Cash)',
    sublabel: 'Règlement physique de la dette',
    badge: 'CASH',
    icon: <Banknote size={16} />,
  },
  {
    value: 'Wave',
    label: 'Wave Mobile Money',
    sublabel: 'Règlement sans frais par Wave',
    badge: 'WAVE',
    icon: <Smartphone size={16} />,
  },
  {
    value: 'Orange Money',
    label: 'Orange Money (OM)',
    sublabel: "Transfert d'argent mobile OM",
    badge: 'OM',
    icon: <Smartphone size={16} />,
  },
  {
    value: 'Free Money',
    label: 'Free Money',
    sublabel: 'Portefeuille électronique Free',
    badge: 'FREE',
    icon: <Smartphone size={16} />,
  },
  {
    value: 'Carte bancaire',
    label: 'Carte Bancaire / TPE',
    sublabel: 'Terminal bancaire ou virement',
    badge: 'TPE',
    icon: <CreditCard size={16} />,
  },
];

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
  const [montant, setMontant] = useState('');
  const [mode, setMode] = useState<string>('Espèces');

  useEffect(() => {
    if (creance) {
      const paye = creance.paiements.reduce((s, p) => s + p.montant, 0);
      const reste = Math.max(0, creance.montantTotal - paye);
      setMontant(reste.toString());
      setMode('Espèces');
    }
  }, [creance, isOpen]);

  if (!isOpen || !creance) return null;

  const totalPaye = creance.paiements.reduce((s, p) => s + p.montant, 0);
  const resteDu = Math.max(0, creance.montantTotal - totalPaye);

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
            <CustomDropdownSelect
              label="Mode de règlement"
              menuTitle="Modes de règlement acceptés"
              value={mode}
              onChange={setMode}
              options={OPTIONS_PAIEMENT}
              icon={<CreditCard size={16} />}
            />
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
