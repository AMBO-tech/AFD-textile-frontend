import React from 'react';
import { X, Store, Warehouse } from 'lucide-react';
import { useMockStore, type Produit } from '../../data/useMockStore';
import { formatMontant } from '../../data/mock';

interface ProductDetailModalProps {
  product: Produit | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
}) => {
  const { stocks, boutiques } = useMockStore();

  if (!product) return null;

  const stocksProduit = stocks.filter((s) => s.produitId === product.id);
  const totalStock = stocksProduit.reduce((sum, s) => sum + s.quantite, 0);

  const getBoutiqueInfo = (boutiqueId: string) => {
    if (boutiqueId === 'b-ent' || boutiqueId === 'entrepot') {
      return { nom: 'Entrepôt Central Yoff', type: 'ENTREPOT' };
    }
    const b = boutiques.find((bt) => bt.id === boutiqueId);
    return { nom: b?.nom || boutiqueId, type: b?.type || 'BOUTIQUE' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[88vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl z-10">
          <div>
            <h2 className="font-display font-bold text-gray-900 text-lg leading-tight">
              {product.nom}
            </h2>
            {product.reference && (
              <span className="text-xs font-mono text-blue-600 font-bold">
                Réf: {product.reference}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {product.photo && (
            <div className="w-full h-44 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100">
              <img
                src={product.photo}
                alt={product.nom}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Attributs intrinsèques catalogue */}
          <div className="grid grid-cols-2 gap-2 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100 text-xs">
            <div>
              <span className="text-gray-400">Catégorie :</span>{' '}
              <strong className="text-gray-800">{product.categorie}</strong>
            </div>
            {product.couleur && (
              <div>
                <span className="text-gray-400">Couleur :</span>{' '}
                <strong className="text-gray-800">{product.couleur}</strong>
              </div>
            )}
            {product.motif && (
              <div className="col-span-2">
                <span className="text-gray-400">Motif :</span>{' '}
                <strong className="text-gray-800">{product.motif}</strong>
              </div>
            )}
            <div className="col-span-2 pt-1 border-t border-gray-200/60 flex items-center justify-between">
              <span className="text-gray-500 font-medium">Stock total sur le réseau :</span>
              <span className="font-bold text-blue-700 text-sm">
                {totalStock} {stocksProduit[0]?.unite || 'unités'}
              </span>
            </div>
          </div>

          {/* Répartition physique du stock par boutique/entrepôt */}
          <div>
            <div className="font-display font-bold text-gray-900 text-sm mb-2.5 flex items-center justify-between">
              <span>Stocks par point de vente / entrepôt</span>
              <span className="text-[11px] font-normal text-gray-500">
                {stocksProduit.length} emplacement(s)
              </span>
            </div>

            {stocksProduit.length === 0 ? (
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center text-xs text-gray-500">
                Ce modèle n'a pas encore été mis en stock dans une boutique.
              </div>
            ) : (
              <div className="space-y-2">
                {stocksProduit.map((stk) => {
                  const info = getBoutiqueInfo(stk.boutiqueId);
                  const isCritique = stk.quantite <= stk.seuil;
                  return (
                    <div
                      key={stk.id}
                      className="p-3.5 rounded-2xl border border-gray-100 bg-white hover:border-blue-100 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                              info.type === 'ENTREPOT'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {info.type === 'ENTREPOT' ? <Warehouse size={14} /> : <Store size={14} />}
                          </div>
                          <span className="font-semibold text-xs text-gray-900">{info.nom}</span>
                        </div>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            stk.quantite === 0
                              ? 'bg-red-50 text-red-700'
                              : isCritique
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-green-50 text-green-700'
                          }`}
                        >
                          {stk.quantite} {stk.unite}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-1 text-[11px] pt-2 border-t border-gray-50">
                        <div>
                          <span className="text-gray-400">Prix vente :</span>
                          <div className="font-bold text-gray-800">{formatMontant(stk.prixVente)}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Prix minimal :</span>
                          <div className="font-bold text-amber-700">{formatMontant(stk.prixMinimal)}</div>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-400">Seuil alerte :</span>
                          <div className="font-semibold text-gray-600">{stk.seuil} {stk.unite}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
