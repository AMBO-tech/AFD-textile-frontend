import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import type { Transfert } from '@/types/stocks';
import type { Boutique } from '@/types/locations';
import { useStockLevelsQuery, useValidateTransferMutation, useCancelTransferMutation } from '../../hooks/queries/useStocksQuery';
import { getErrorMessage } from '../../services/api';
import SelectField from '../ui/SelectField';
import { optionsEmplacements } from '../ui/locationOptions';

/** Plafond imposé par l'API sur les listes paginées. */
const API_PAGE_MAX = 100;

interface ValidateTransferModalProps {
  transfert: Transfert;
  emplacements: Boutique[];
  onClose: () => void;
}

/** Traitement d'une demande par le gérant : choix de la source (stock disponible affiché), validation ou refus. */
export const ValidateTransferModal: React.FC<ValidateTransferModalProps> = ({ transfert, emplacements, onClose }) => {
  const sources = emplacements.filter((l) => l.id !== transfert.locationDestinationId);
  const sourceParDefaut =
    transfert.locationSourceId ?? sources.find((l) => l.type === 'ENTREPOT')?.id ?? sources[0]?.id ?? '';
  const [sourceId, setSourceId] = useState(sourceParDefaut);
  const [motifRefus, setMotifRefus] = useState('');
  const [modeRefus, setModeRefus] = useState(false);
  const [erreur, setErreur] = useState('');

  const { data: stockSource } = useStockLevelsQuery(
    sourceId ? { locationId: sourceId, limit: API_PAGE_MAX } : undefined,
    { enabled: Boolean(sourceId) },
  );
  const { mutateAsync: validate, isPending: validating } = useValidateTransferMutation();
  const { mutateAsync: cancel, isPending: cancelling } = useCancelTransferMutation();

  const disponible = (produitId: string) =>
    stockSource?.data.find((s) => s.produitId === produitId)?.quantite ?? 0;
  const stockSuffisant = transfert.lignes.every((l) => disponible(l.produitId) >= l.quantite);

  const valider = async () => {
    setErreur('');
    try {
      await validate({ id: transfert.id, locationSourceId: sourceId });
      toast.success(`Transfert ${transfert.reference} validé : stock déplacé vers ${transfert.locationDestinationNom}.`);
      onClose();
    } catch (error) {
      setErreur(getErrorMessage(error, 'La validation a échoué.'));
    }
  };

  const refuser = async () => {
    if (motifRefus.trim().length < 3) return;
    setErreur('');
    try {
      await cancel({ id: transfert.id, motif: motifRefus.trim() });
      toast.success(`Demande ${transfert.reference} refusée.`);
      onClose();
    } catch (error) {
      setErreur(getErrorMessage(error, 'Le refus a échoué.'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h3 className="font-display font-bold text-gray-900 text-base">Demande {transfert.reference}</h3>
            <p className="text-xs text-gray-500">
              {transfert.demandeurNom} • pour {transfert.locationDestinationNom}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-3">
          <SelectField
            label="Prélever depuis"
            value={sourceId}
            onChange={setSourceId}
            options={optionsEmplacements(sources.filter((l) => l.actif))}
          />

          <div className="divide-y divide-gray-50 border border-gray-100 rounded-xl">
            {transfert.lignes.map((l) => {
              const dispo = disponible(l.produitId);
              const ok = dispo >= l.quantite;
              return (
                <div key={l.id} className="p-2.5 flex items-center justify-between text-xs gap-2">
                  <span className="truncate">{l.produitNom}</span>
                  <span className="flex items-center gap-1.5 shrink-0">
                    <span className="font-bold">
                      {l.quantite} {l.unite.toLowerCase()}
                    </span>
                    <ArrowRight size={12} className="text-gray-300" />
                    <span className={ok ? 'text-emerald-600' : 'text-red-600 font-semibold'}>{dispo} dispo</span>
                  </span>
                </div>
              );
            })}
          </div>
          {!stockSuffisant && (
            <p className="text-[11px] text-red-600">Stock insuffisant à cette source pour au moins un tissu.</p>
          )}

          {modeRefus && (
            <input
              value={motifRefus}
              onChange={(e) => setMotifRefus(e.target.value)}
              autoFocus
              placeholder="Motif du refus (obligatoire)"
              className="w-full h-9 px-3 rounded-xl border border-gray-200 text-xs"
            />
          )}

          {erreur && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              <AlertCircle size={15} className="shrink-0 mt-0.5" /> <span>{erreur}</span>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 grid grid-cols-2 gap-2">
          {modeRefus ? (
            <>
              <button onClick={() => setModeRefus(false)} className="py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100">
                Retour
              </button>
              <button
                onClick={refuser}
                disabled={motifRefus.trim().length < 3 || cancelling}
                className="py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 disabled:opacity-50"
              >
                {cancelling ? 'Refus…' : 'Confirmer le refus'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setModeRefus(true)}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 border border-rose-200 hover:bg-rose-50"
              >
                <XCircle size={15} /> Refuser
              </button>
              <button
                onClick={valider}
                disabled={!sourceId || !stockSuffisant || validating}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-50"
                style={{ background: '#16a34a' }}
              >
                <CheckCircle2 size={15} /> {validating ? 'Validation…' : 'Valider le transfert'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValidateTransferModal;
