import { formatMontant } from '@/utils/format';
import React, { useState } from 'react';
import { X, ShoppingCart, Tag } from 'lucide-react';
import type { LigneVente, PosProduit, UniteVente } from './types';
import {
  LIBELLES_UNITE,
  montantsLigne,
  prixParUnite,
  quantiteEnStock,
  unitesDisponibles,
} from '../../features/pos/pricing';

interface SalesProductConfigProps {
  produit: PosProduit | null;
  onClose: () => void;
  onAddToCart: (ligne: LigneVente) => void;
  onDirectSale: (ligne: LigneVente) => void;
}

const QTE_PAR_DEFAUT = 1;

/** Fenêtre de configuration d'un article. Remontée à chaque produit (clé = id) pour réinitialiser la saisie. */
export const SalesProductConfig: React.FC<SalesProductConfigProps> = ({
  produit,
  onClose,
  onAddToCart,
  onDirectSale,
}) => {
  const [qte, setQte] = useState(QTE_PAR_DEFAUT);
  const [unite, setUnite] = useState<UniteVente | null>(produit?.unite ?? null);
  const [remiseMontant, setRemiseMontant] = useState(0);

  if (!produit || !unite) return null;

  const ligne: LigneVente = { produit, qte, unite, remise: remiseMontant };
  const { brut, remise, net } = montantsLigne(ligne);
  const qteStock = quantiteEnStock(qte, unite, produit) ?? 0;
  const depasseStock = qteStock > produit.quantite;
  const isValide = qte > 0 && !depasseStock && net > 0;

  const valider = (action: (l: LigneVente) => void) => {
    if (!isValide) return;
    action({ ...ligne, remise });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
          <div className="font-display font-bold text-gray-900 text-base">Configurer l'article</div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        {/* Aperçu */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 mb-4">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-white flex-shrink-0 border border-gray-200">
            <img src={produit.photo} alt={produit.nom} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-gray-900 text-sm truncate">{produit.nom}</div>
            <div className="text-xs text-gray-500">{produit.reference}</div>
            <div className="text-xs font-semibold text-blue-600 mt-0.5">
              {formatMontant(prixParUnite(unite, produit))} / {LIBELLES_UNITE[unite]} (En stock :{' '}
              {produit.quantite} {LIBELLES_UNITE[produit.unite]})
            </div>
          </div>
        </div>

        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Quantité</label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setQte((q) => Math.max(QTE_PAR_DEFAUT, q - 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 font-bold text-gray-700 hover:bg-gray-100"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  inputMode="decimal"
                  value={qte}
                  onChange={(e) => setQte(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full h-9 border border-gray-200 text-center font-bold text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQte((q) => q + 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-r-xl border border-l-0 border-gray-200 bg-gray-50 font-bold text-gray-700 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Unité</label>
              <select
                value={unite}
                onChange={(e) => setUnite(e.target.value as UniteVente)}
                className="w-full h-9 px-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-blue-500"
              >
                {unitesDisponibles(produit).map((u) => (
                  <option key={u} value={u}>
                    {LIBELLES_UNITE[u]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {unite !== produit.unite && qte > 0 && (
            <p className="text-[11px] text-gray-500">
              Soit {qteStock} {LIBELLES_UNITE[produit.unite]} retiré(s) du stock.
            </p>
          )}
          {depasseStock && (
            <p className="text-[11px] font-semibold text-rose-600">
              Stock insuffisant : {produit.quantite} {LIBELLES_UNITE[produit.unite]} disponible(s).
            </p>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Remise commerciale (FCFA)</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max={brut}
                value={remiseMontant || ''}
                onChange={(e) => setRemiseMontant(Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-blue-500"
              />
              <Tag size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-gray-500">Total net à payer :</div>
              {remise > 0 && <div className="text-[10px] text-gray-400 line-through">{formatMontant(brut)}</div>}
            </div>
            <div className="font-display font-bold text-lg text-blue-900">{formatMontant(net)}</div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => valider((l) => {
                onAddToCart(l);
                onClose();
              })}
              disabled={!isValide}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <ShoppingCart size={15} />
              Mettre au panier
            </button>
            <button
              type="button"
              onClick={() => valider(onDirectSale)}
              disabled={!isValide}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white text-xs font-semibold shadow-sm hover:opacity-95 transition-all disabled:opacity-50"
              style={{ background: '#0F3D5E' }}
            >
              Encaisser maintenant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesProductConfig;
