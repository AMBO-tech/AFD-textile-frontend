import React from 'react';
import { ArrowRight, Warehouse, Building2 } from 'lucide-react';



const UNITES = ['mètre', 'yard', 'kilo', 'rouleau'] as const;

interface EntrepotTransferFormProps {
  produit: Produit | null;
  sourceId: string;
  onSourceChange: (id: string) => void;
  destId: string;
  onDestChange: (id: string) => void;
  quantite: string;
  onQuantiteChange: (q: string) => void;
  unite: string;
  onUniteChange: (u: string) => void;
  boutiques: Boutique[];
  onSubmit: (e: React.FormEvent) => void;
}

export const EntrepotTransferForm: React.FC<EntrepotTransferFormProps> = ({
  produit,
  sourceId,
  onSourceChange,
  destId,
  onDestChange,
  quantite,
  onQuantiteChange,
  unite,
  onUniteChange,
  boutiques,
  onSubmit,
}) => {
  const emplacements = [
    { id: 'entrepot', nom: 'Entrepôt Central', lieu: 'Dakar - Zone Industrielle' },
    ...boutiques,
  ];

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
      <div className="font-display font-bold text-gray-900 text-base">
        1. Paramètres de l'Expédition
      </div>

      {/* Source et destination */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Origine (Départ) *
          </label>
          <select
            value={sourceId}
            onChange={(e) => onSourceChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-blue-500 bg-gray-50"
          >
            {emplacements.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.nom} ({emp.lieu})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Destination (Arrivée) *
          </label>
          <select
            value={destId}
            onChange={(e) => onDestChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-blue-500 bg-gray-50"
          >
            {emplacements
              .filter((emp) => emp.id !== sourceId)
              .map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nom} ({emp.lieu})
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Produit sélectionné et quantité */}
      {produit ? (
        <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-11 h-11 rounded-lg overflow-hidden bg-white flex-shrink-0">
              <img src={produit.photo} alt={produit.nom} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-gray-900 text-xs truncate">{produit.nom}</div>
              <div className="text-[11px] text-gray-500">
                Dispo source : <span className="font-bold text-blue-700">{produit.quantite} {produit.unite}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-24">
              <input
                type="number"
                required
                min="1"
                max={produit.quantite}
                value={quantite}
                onChange={(e) => onQuantiteChange(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-center focus:outline-none"
              />
            </div>
            <span className="text-xs font-medium text-gray-500">{unite}</span>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-400">
          Sélectionnez un article ci-dessous pour préparer l'envoi
        </div>
      )}

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={!produit || parseFloat(quantite) <= 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white shadow-sm hover:opacity-95 disabled:opacity-50 transition-all"
          style={{ background: '#0F3D5E' }}
        >
          <ArrowRight size={15} />
          Expédier le transfert
        </button>
      </div>
    </form>
  );
};

export default EntrepotTransferForm;
