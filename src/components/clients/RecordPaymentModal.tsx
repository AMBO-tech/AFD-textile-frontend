import { formatMontant } from '@/utils/format';
import React, { useState } from 'react';
import { X, CreditCard, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Client } from '@/types/clients';
import type { Boutique } from '@/types/locations';
import type { MoyenPaiement } from '@/types/enums';
import { MODES_PAIEMENT, soldeClient } from './types';
import { useRecordPaymentMutation } from '../../hooks/queries/useClientsQuery';
import { getErrorMessage } from '../../services/api';
import SelectField from '../ui/SelectField';
import { optionsEmplacements } from '../ui/locationOptions';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  boutiques: Boutique[];
  /** Caisse imposée (boutiquier) ; sinon le gérant choisit la boutique qui encaisse. */
  boutiqueImposee?: string | null;
}

/**
 * Règlement d'un client : POST /reglements. Le serveur répartit le montant sur les factures
 * impayées les plus anciennes (FIFO) et émet un reçu REC-AAAA-MM-XXXX.
 */
export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  client,
  boutiques,
  boutiqueImposee,
}) => {
  const solde = soldeClient(client);
  const [montant, setMontant] = useState(String(solde));
  const [mode, setMode] = useState<MoyenPaiement>(MODES_PAIEMENT[0].api);
  const [boutiqueId, setBoutiqueId] = useState(boutiqueImposee ?? boutiques[0]?.id ?? '');
  const [erreur, setErreur] = useState('');
  const { mutateAsync: recordPayment, isPending } = useRecordPaymentMutation();

  if (!isOpen) return null;

  const montantNum = parseFloat(montant) || 0;
  const invalide = montantNum <= 0 || montantNum > solde || !boutiqueId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (invalide || isPending) return;
    setErreur('');
    try {
      const recu = await recordPayment({
        clientId: client.id,
        montantTotal: montantNum,
        modePaiement: mode,
        ...(boutiqueImposee ? {} : { boutiqueId }),
        idempotencyKey: crypto.randomUUID(),
      });
      toast.success(`Règlement ${recu.referenceRecu} de ${formatMontant(montantNum)} enregistré pour ${client.nom}.`);
      onClose();
    } catch (error) {
      setErreur(getErrorMessage(error, "Le règlement n'a pas pu être enregistré."));
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <CreditCard size={18} />
            </div>
            <div>
              <div className="font-display font-bold text-gray-900 text-base">Règlement de créance</div>
              <div className="text-xs text-gray-500">
                {client.nom} • reste dû {formatMontant(solde)}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {!boutiqueImposee && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Boutique qui encaisse</label>
              <SelectField value={boutiqueId} onChange={setBoutiqueId} options={optionsEmplacements(boutiques)} aria-label="Boutique qui encaisse" />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Montant versé (FCFA)</label>
            <input
              type="number"
              min="1"
              step="any"
              max={solde}
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Réparti automatiquement sur les factures les plus anciennes.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Mode de paiement</label>
            <SelectField
              value={mode}
              onChange={(v) => setMode(v as MoyenPaiement)}
              options={MODES_PAIEMENT.map((m) => ({ value: m.api, label: m.label }))}
              aria-label="Mode de paiement"
            />
          </div>

          {erreur && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              <AlertCircle size={15} className="shrink-0 mt-0.5" /> <span>{erreur}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={invalide || isPending}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-50"
            style={{ background: '#16a34a' }}
          >
            {isPending ? 'Enregistrement…' : `Encaisser ${formatMontant(montantNum)}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RecordPaymentModal;
