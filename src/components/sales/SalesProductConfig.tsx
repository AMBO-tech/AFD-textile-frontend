import React, { useState } from 'react';
import { X, ShoppingCart, Tag, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { StockEnriched } from '../../data/useMockStore';
import { formatMontant } from '../../data/mock';

interface SalesProductConfigProps {
  produit: StockEnriched | null;
  onClose: () => void;
  onAddToCart: (ligne: { produit: StockEnriched; qte: number; unite: string; remise: number }) => void;
  onDirectSale: (ligne: { produit: StockEnriched; qte: number; unite: string; remise: number }) => void;
}

interface InnerModalProps {
  produit: StockEnriched;
  onClose: () => void;
  onAddToCart: (ligne: { produit: StockEnriched; qte: number; unite: string; remise: number }) => void;
  onDirectSale: (ligne: { produit: StockEnriched; qte: number; unite: string; remise: number }) => void;
}

const SalesProductConfigModal: React.FC<InnerModalProps> = ({
  produit,
  onClose,
  onAddToCart,
  onDirectSale,
}) => {
  const isRupture = produit.quantite <= 0;
  const [qte, setQte] = useState(isRupture ? 0 : Math.min(1, produit.quantite));
  const unite = produit.unite || 'mètre';
  const [remiseMontant, setRemiseMontant] = useState(0);

  const sousTotal = produit.prix * qte;
  const remiseAppliquee = Math.min(remiseMontant, sousTotal);
  const totalNet = sousTotal - remiseAppliquee;
  const prixNetUnitaire = qte > 0 ? totalNet / qte : produit.prix;
  const isSousPrixMinimal = Boolean(produit.prixMinimal && prixNetUnitaire < produit.prixMinimal);

  const handleAjouter = () => {
    if (isRupture || qte <= 0) return;
    onAddToCart({
      produit,
      qte,
      unite,
      remise: remiseAppliquee,
    });
    onClose();
  };

  const handleVenteDirecte = () => {
    if (isRupture || qte <= 0) return;
    onDirectSale({
      produit,
      qte,
      unite,
      remise: remiseAppliquee,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
          <div className="font-display font-bold text-gray-900 text-base">
            Configurer l'Article
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={18} />
          </button>
        </div>

        {/* Aperçu */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 mb-4">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-white flex-shrink-0 border border-gray-200">
            <img src={produit.photo} alt={produit.nom} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm">{produit.nom}</div>
            <div className="text-xs text-gray-500">
              {produit.categorie} • {produit.couleur}
            </div>
            <div className="text-xs font-semibold text-blue-600 mt-0.5">
              {formatMontant(produit.prix)} / {produit.unite} (En stock : {produit.quantite})
            </div>
          </div>
        </div>

        {/* Rupture banner */}
        {isRupture && (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-700 text-xs font-semibold mb-3">
            <AlertTriangle size={15} className="shrink-0 text-red-600" />
            <span>Article en rupture de stock dans cette boutique (0 disponible).</span>
          </div>
        )}

        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Quantité commandée
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  disabled={isRupture}
                  onClick={() => setQte((q) => Math.max(0.5, Math.round((q - 0.5) * 10) / 10))}
                  className="w-11 h-11 flex items-center justify-center rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 font-bold text-lg text-gray-700 hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  max={produit.quantite}
                  disabled={isRupture}
                  value={qte || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (isNaN(val)) setQte(0);
                    else setQte(Math.min(produit.quantite, Math.max(0.1, Math.round(val * 100) / 100)));
                  }}
                  className="w-full h-11 border border-gray-200 text-center font-bold text-base focus:outline-none disabled:bg-gray-100"
                />
                <button
                  type="button"
                  disabled={isRupture}
                  onClick={() => setQte((q) => Math.min(produit.quantite, Math.round((q + 0.5) * 10) / 10))}
                  className="w-11 h-11 flex items-center justify-center rounded-r-xl border border-l-0 border-gray-200 bg-gray-50 font-bold text-lg text-gray-700 hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Unité (catalogue)
              </label>
              <div className="h-11 px-3.5 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between text-xs font-bold text-gray-700">
                <span className="capitalize">{unite}</span>
                <span className="text-[10px] text-gray-400 font-normal">Fixe</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Remise commerciale (FCFA)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max={sousTotal}
                disabled={isRupture}
                value={remiseMontant || ''}
                onChange={(e) => setRemiseMontant(Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
              />
              <Tag size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Avertissement prix minimal */}
          {isSousPrixMinimal && (
            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-1.5 text-amber-800 text-[11px] font-medium">
              <AlertTriangle size={13} className="shrink-0 text-amber-600" />
              <span>Prix unitaire ({formatMontant(Math.round(prixNetUnitaire))}) sous le prix plancher minimal ({formatMontant(produit.prixMinimal)}).</span>
            </div>
          )}

          {/* Calcul du total */}
          <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-gray-500">Total net à payer :</div>
              {remiseAppliquee > 0 && (
                <div className="text-[10px] text-gray-400 line-through">
                  {formatMontant(sousTotal)}
                </div>
              )}
            </div>
            <div className="font-display font-bold text-lg text-blue-900">
              {formatMontant(totalNet)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              disabled={isRupture || qte <= 0}
              onClick={handleAjouter}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <ShoppingCart size={15} />
              Mettre au panier
            </button>
            <button
              type="button"
              disabled={isRupture || qte <= 0}
              onClick={handleVenteDirecte}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white text-xs font-semibold shadow-sm hover:opacity-95 transition-all disabled:opacity-40 cursor-pointer"
              style={{ background: '#0F3D5E' }}
            >
              <span>Vente directe (comptant)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SalesProductConfig: React.FC<SalesProductConfigProps> = ({
  produit,
  onClose,
  onAddToCart,
  onDirectSale,
}) => {
  if (!produit) return null;

  return (
    <SalesProductConfigModal
      produit={produit}
      onClose={onClose}
      onAddToCart={onAddToCart}
      onDirectSale={onDirectSale}
    />
  );
};

export default SalesProductConfig;
