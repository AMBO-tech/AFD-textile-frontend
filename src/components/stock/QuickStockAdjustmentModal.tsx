import React, { useState } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, AlertTriangle, Store, Warehouse, ClipboardList, Truck, RotateCcw, FileText, AlertCircle, Scissors } from 'lucide-react';
import type { StockEnriched, Boutique } from '../../data/useMockStore';
import { CustomDropdownSelect } from '../ui/CustomDropdownSelect';

interface QuickStockAdjustmentModalProps {
  produit: StockEnriched | null;
  boutiques?: Boutique[];
  onClose: () => void;
  onSubmit: (produitId: string, quantiteChange: number, motif: string) => void;
}

export const QuickStockAdjustmentModal: React.FC<QuickStockAdjustmentModalProps> = ({
  produit,
  boutiques = [],
  onClose,
  onSubmit,
}) => {
  const [typeAjustement, setTypeAjustement] = useState<'entree' | 'sortie'>('entree');
  const [quantite, setQuantite] = useState('10');
  const [motif, setMotif] = useState('Réassort boutique');

  if (!produit) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qteNum = parseFloat(quantite);
    if (isNaN(qteNum) || qteNum <= 0) return;

    const qteFinale = typeAjustement === 'entree' ? qteNum : -qteNum;
    onSubmit(produit.stockId || produit.id, qteFinale, motif);
    onClose();
  };

  const handleTypeChange = (nouveauType: 'entree' | 'sortie') => {
    setTypeAjustement(nouveauType);
    if (nouveauType === 'entree') {
      setMotif('Réassort boutique');
    } else {
      setMotif('Perte / Casse');
    }
  };

  const isSortieExcessive = typeAjustement === 'sortie' && parseFloat(quantite) > produit.quantite;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
          <div className="font-display font-bold text-gray-900 text-base">
            Ajustement Rapide de Stock
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Aperçu produit & emplacement */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 mb-3.5">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white flex-shrink-0 border border-gray-200">
            <img src={produit.photo} alt={produit.nom} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-gray-900 text-sm truncate">{produit.nom}</div>
            <div className="text-xs text-gray-500">
              Stock actuel : <span className="font-bold text-blue-600">{produit.quantite} {produit.unite}</span>
            </div>
            {/* Badge emplacement */}
            {(() => {
              const bId = produit.boutiqueId || produit.boutique;
              const isEntrepot = bId === 'entrepot' || bId === 'b-ent';
              const nomEmp = isEntrepot
                ? 'Entrepôt Central'
                : (boutiques?.find((b) => b.id === bId)?.nom || bId);

              return (
                <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 mt-1">
                  {isEntrepot ? (
                    <Warehouse size={12} className="text-amber-600 shrink-0" />
                  ) : (
                    <Store size={12} className="text-blue-600 shrink-0" />
                  )}
                  <span className="truncate">{nomEmp}</span>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Sélecteur Type : Entrée vs Perte/Sortie */}
        <div className="grid grid-cols-2 gap-2 mb-3.5 p-1 bg-gray-100 rounded-xl">
          <button
            type="button"
            onClick={() => handleTypeChange('entree')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              typeAjustement === 'entree'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <ArrowDownLeft size={14} className={typeAjustement === 'entree' ? 'text-emerald-600' : 'text-gray-400'} />
            Entrée (+)
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('sortie')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              typeAjustement === 'sortie'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <ArrowUpRight size={14} className={typeAjustement === 'sortie' ? 'text-rose-600' : 'text-gray-400'} />
            Perte / Sortie (-)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {typeAjustement === 'entree' ? 'Quantité à ajouter' : 'Quantité à déduire'} ({produit.unite}) *
            </label>
            <input
              type="number"
              min="0.1"
              max={typeAjustement === 'sortie' ? produit.quantite : undefined}
              step="any"
              required
              value={quantite}
              onChange={(e) => setQuantite(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-sm font-bold text-gray-900 focus:outline-none ${
                isSortieExcessive ? 'border-rose-400 bg-rose-50/50' : 'border-gray-200 focus:border-blue-500'
              }`}
            />
            {isSortieExcessive && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertTriangle size={12} />
                La quantité dépasse le stock disponible ({produit.quantite} {produit.unite})
              </p>
            )}
          </div>

          <div>
            <CustomDropdownSelect
              label="Motif de l'opération"
              value={motif}
              onChange={setMotif}
              icon={<ClipboardList size={15} />}
              menuTitle="Justification du mouvement"
              options={
                typeAjustement === 'entree'
                  ? [
                      {
                        value: 'Réassort boutique',
                        label: 'Réassort boutique',
                        sublabel: 'Arrivage ou transfert interne',
                        icon: <Truck size={14} className="text-blue-500" />,
                        badge: 'Entrée',
                      },
                      {
                        value: 'Arrivage fournisseur',
                        label: 'Arrivage fournisseur',
                        sublabel: 'Réception directe commande fournisseur',
                        icon: <Truck size={14} className="text-emerald-500" />,
                        badge: 'Fournisseur',
                      },
                      {
                        value: 'Retour client',
                        label: 'Retour client',
                        sublabel: 'Réintégration suite annulation/échange',
                        icon: <RotateCcw size={14} className="text-amber-500" />,
                        badge: 'Retour',
                      },
                      {
                        value: 'Correction inventaire (+)',
                        label: 'Correction inventaire (+)',
                        sublabel: 'Surplus constaté lors du comptage physique',
                        icon: <FileText size={14} className="text-purple-500" />,
                        badge: 'Inventaire',
                      },
                    ]
                  : [
                      {
                        value: 'Perte / Casse',
                        label: 'Perte / Casse',
                        sublabel: 'Disparition ou casse lors de manipulation',
                        icon: <AlertCircle size={14} className="text-rose-500" />,
                        badge: 'Perte',
                      },
                      {
                        value: 'Tissu détérioré / taché',
                        label: 'Tissu détérioré / taché',
                        sublabel: 'Tissu impropre à la vente',
                        icon: <AlertCircle size={14} className="text-amber-500" />,
                        badge: 'Défaut',
                      },
                      {
                        value: 'Correction inventaire (-)',
                        label: 'Correction inventaire (-)',
                        sublabel: 'Manquant constaté lors du comptage physique',
                        icon: <FileText size={14} className="text-indigo-500" />,
                        badge: 'Inventaire',
                      },
                      {
                        value: 'Échantillonnage client',
                        label: 'Échantillonnage client',
                        sublabel: 'Prélèvement pour catalogue / coupons client',
                        icon: <Scissors size={14} className="text-sky-500" />,
                        badge: 'Échantillon',
                      },
                    ]
              }
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSortieExcessive}
              className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow-sm hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
              style={{ background: typeAjustement === 'entree' ? '#0F3D5E' : '#DC2626' }}
            >
              {typeAjustement === 'entree' ? 'Valider l\'entrée (+)' : 'Valider la déduction (-)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickStockAdjustmentModal;
