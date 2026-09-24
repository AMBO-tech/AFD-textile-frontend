import React, { useState } from 'react';
import { X, ClipboardCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { StockLevel } from '@/types/stocks';
import { LIBELLES_UNITE } from '../../features/pos/pricing';
import { useAdjustStockMutation } from '../../hooks/queries/useStocksQuery';
import { getErrorMessage } from '../../services/api';

interface StockAdjustModalProps {
  stock: StockLevel | null;
  onClose: () => void;
}

/** Inventaire (gérant) : enregistre la quantité réellement comptée, avec une justification obligatoire. */
export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({ stock, onClose }) => {
  const [quantite, setQuantite] = useState(stock ? String(stock.quantite) : '');
  const [justification, setJustification] = useState('');
  const [erreur, setErreur] = useState('');
  const { mutateAsync: adjust, isPending } = useAdjustStockMutation();

  if (!stock) return null;

  const unite = LIBELLES_UNITE[stock.uniteStockage];
  const nouvelle = parseFloat(quantite);
  const valide = nouvelle >= 0 && justification.trim().length >= 3 && nouvelle !== stock.quantite;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valide || isPending) return;
    setErreur('');
    try {
      await adjust({
        produitId: stock.produitId,
        locationId: stock.locationId,
        nouvelleQuantite: nouvelle,
        uniteUtilisee: stock.uniteStockage,
        justification: justification.trim(),
      });
      toast.success(`${stock.produitNom} : stock corrigé à ${nouvelle} ${unite}.`);
      onClose();
    } catch (error) {
      setErreur(getErrorMessage(error, "L'ajustement a échoué."));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <ClipboardCheck size={18} />
            </div>
            <div className="min-w-0">
              <div className="font-display font-bold text-gray-900 text-sm truncate">Inventaire</div>
              <div className="text-xs text-gray-500 truncate">
                {stock.produitNom} • {stock.locationNom}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Quantité comptée ({unite}s) — actuellement {stock.quantite}
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={quantite}
              onChange={(e) => setQuantite(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-gray-200 text-sm font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Justification *</label>
            <input
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Ex : inventaire mensuel, tissu abîmé…"
              className="w-full h-9 px-3 rounded-xl border border-gray-200 text-xs"
            />
          </div>
          {erreur && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              <AlertCircle size={15} className="shrink-0 mt-0.5" /> <span>{erreur}</span>
            </div>
          )}
          <button
            type="submit"
            disabled={!valide || isPending}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-50"
            style={{ background: '#0F3D5E' }}
          >
            {isPending ? 'Enregistrement…' : 'Enregistrer l’inventaire'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustModal;
