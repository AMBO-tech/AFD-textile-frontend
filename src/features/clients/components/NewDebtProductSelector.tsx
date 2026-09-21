import React from 'react';
import { Plus, Package, AlertTriangle } from 'lucide-react';
import CustomDropdownSelect from '../../../components/ui/CustomDropdownSelect';
import type { StockEnriched } from '../../../data/useMockStore';

interface NewDebtProductSelectorProps {
  produits: StockEnriched[];
  selectedProdId: string;
  onSelectProdId: (id: string) => void;
  selectedProd?: StockEnriched;
  quantite: string;
  onChangeQuantite: (val: string) => void;
  prixUnitaire: string;
  onChangePrixUnitaire: (val: string) => void;
  errorStock: string | null;
  onAjouterLigne: () => void;
  formatMontant: (n: number) => string;
}

export const NewDebtProductSelector: React.FC<NewDebtProductSelectorProps> = ({
  produits,
  selectedProdId,
  onSelectProdId,
  selectedProd,
  quantite,
  onChangeQuantite,
  prixUnitaire,
  onChangePrixUnitaire,
  errorStock,
  onAjouterLigne,
  formatMontant,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
      <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">
        1. Sélectionner les tissus livrés
      </div>

      <div className="space-y-1">
        <CustomDropdownSelect
          label="Tissu / Article en stock"
          value={selectedProdId}
          onChange={onSelectProdId}
          icon={<Package size={15} />}
          menuTitle="Articles disponibles"
          options={produits.map((p) => ({
            value: p.id,
            label: p.nom,
            sublabel: `${p.categorie} (${p.couleur}) · Dispo: ${p.quantite} ${p.unite}`,
            badge: `${p.quantite} ${p.unite}`,
            icon: <Package size={14} />,
          }))}
        />
        {selectedProd && (
          <div className="text-[11px] text-gray-500 flex flex-wrap justify-between gap-1 px-1">
            <span>
              Stock boutique :{' '}
              <strong className={selectedProd.quantite < 10 ? 'text-amber-600' : 'text-green-600'}>
                {selectedProd.quantite} {selectedProd.unite}
              </strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span>
                Prix vente : <strong className="text-gray-800">{formatMontant(selectedProd.prix)}</strong>
              </span>
              {selectedProd.prixMinimal && (
                <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded-md">
                  Plancher : {formatMontant(selectedProd.prixMinimal)}
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Saisie quantité et prix unitaire */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Quantité livrée ({selectedProd?.unite || 'mètre'})
          </label>
          <input
            type="number"
            min="0.5"
            step="0.5"
            value={quantite}
            onChange={(e) => onChangeQuantite(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Prix convenu (FCFA)
          </label>
          <input
            type="number"
            min="0"
            step="100"
            value={prixUnitaire}
            onChange={(e) => onChangePrixUnitaire(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Erreur stock */}
      {errorStock && (
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertTriangle size={14} className="shrink-0" />
          <span>{errorStock}</span>
        </div>
      )}

      <button
        type="button"
        onClick={onAjouterLigne}
        className="w-full py-2.5 px-3 rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 text-blue-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
      >
        <Plus size={14} />
        <span>Ajouter cet article à la commande</span>
      </button>
    </div>
  );
};

export default NewDebtProductSelector;
