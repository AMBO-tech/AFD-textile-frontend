import React from 'react';
import { X, Trash2, ShoppingCart, CreditCard } from 'lucide-react';
import type { LigneVente } from './types';

import { MODES_PAIEMENT } from './types';

interface SalesCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  panier: LigneVente[];
  onUpdateQte: (index: number, newQte: number) => void;
  onRemoveItem: (index: number) => void;
  modePaiement: string;
  onModePaiementChange: (mode: string) => void;
  nomClient: string;
  onNomClientChange: (nom: string) => void;
  onCheckout: () => void;
}

export const SalesCartDrawer: React.FC<SalesCartDrawerProps> = ({
  isOpen,
  onClose,
  panier,
  onUpdateQte,
  onRemoveItem,
  modePaiement,
  onModePaiementChange,
  nomClient,
  onNomClientChange,
  onCheckout,
}) => {
  if (!isOpen) return null;

  const total = panier.reduce(
    (s, l) => s + l.produit.prix * l.qte - Math.min(l.remise, l.produit.prix * l.qte),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg p-5 shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingCart size={18} />
            </div>
            <div>
              <div className="font-display font-bold text-gray-900 text-base">
                Panier de Vente ({panier.length} article{panier.length > 1 ? 's' : ''})
              </div>
              <div className="text-xs text-gray-400">Vérifiez les articles avant validation</div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 py-2">
          {panier.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-400">
              Votre panier est vide. Sélectionnez un tissu pour commencer.
            </div>
          ) : (
            panier.map((l, idx) => {
              const ligneNet = l.produit.prix * l.qte - Math.min(l.remise, l.produit.prix * l.qte);

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50 gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-white flex-shrink-0 border border-gray-200">
                      <img src={l.produit.photo} alt={l.produit.nom} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 text-xs truncate">
                        {l.produit.nom}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {formatMontant(l.produit.prix)}/{l.unite}
                        {l.remise > 0 && (
                          <span className="text-green-600 ml-1.5 font-medium">
                            (-{formatMontant(l.remise)})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden">
                      <button
                        type="button"
                        onClick={() => onUpdateQte(idx, Math.max(1, l.qte - 1))}
                        className="px-2 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="px-2 py-1 text-xs font-bold text-gray-800">{l.qte}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateQte(idx, l.qte + 1)}
                        className="px-2 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <div className="font-bold text-gray-900 text-xs">{formatMontant(ligneNet)}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(idx)}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {panier.length > 0 && (
          <div className="pt-3 border-t border-gray-100 space-y-3 flex-shrink-0">
            {/* Nom du client ou Passage */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Client bénéficiaire
                </label>
                <input
                  type="text"
                  value={nomClient}
                  onChange={(e) => onNomClientChange(e.target.value)}
                  placeholder="Passage (Comptoir)"
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Moyen d'encaissement
                </label>
                <select
                  value={modePaiement}
                  onChange={(e) => onModePaiementChange(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-blue-500"
                >
                  {MODES_PAIEMENT.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Total et encaissement */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
              <div>
                <div className="text-xs text-gray-500">Montant total net :</div>
                <div className="font-display font-bold text-xl text-gray-900">{formatMontant(total)}</div>
              </div>

              <button
                type="button"
                onClick={onCheckout}
                className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm shadow-sm hover:opacity-95 transition-all"
                style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
              >
                Encaisser la vente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesCartDrawer;
