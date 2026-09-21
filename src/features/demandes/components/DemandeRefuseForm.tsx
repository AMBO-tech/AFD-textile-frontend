import React from 'react';
import { Ban, AlertCircle } from 'lucide-react';
import type { Demande } from '../../../data/useMockStore';

interface DemandeRefuseFormProps {
  demande: Demande;
  motifRefus: string;
  onChangeMotif: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const DemandeRefuseForm: React.FC<DemandeRefuseFormProps> = ({
  demande,
  motifRefus,
  onChangeMotif,
  onSubmit,
  onClose,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
        <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
        <div>
          <span className="font-semibold block">Attention : action irréversible</span>
          La demande sera marquée comme refusée et le demandeur sera notifié de la décision.
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Motif du refus *
        </label>
        <textarea
          rows={3}
          required
          value={motifRefus}
          onChange={(e) => onChangeMotif(e.target.value)}
          placeholder="Précisez pourquoi cette demande ne peut pas être pourvue..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 bg-white focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
        />
      </div>

      {/* Boutons actions */}
      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Retour
        </button>
        <button
          type="submit"
          disabled={!motifRefus.trim()}
          className="flex-[2] flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-95 transition-all bg-red-600 hover:bg-red-700 disabled:opacity-50 cursor-pointer"
        >
          <Ban size={15} />
          <span>Confirmer le refus</span>
        </button>
      </div>
    </form>
  );
};

export default DemandeRefuseForm;
