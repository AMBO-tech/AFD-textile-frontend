import React from 'react';
import { Truck, AlertTriangle, CheckCircle2, Warehouse, Store } from 'lucide-react';
import type { Demande, Boutique } from '../../../data/useMockStore';
import CustomDropdownSelect, { type DropdownOption } from '../../../components/ui/CustomDropdownSelect';

interface DemandeAcceptFormProps {
  demande: Demande;
  sourcesDisponibles: Array<{
    sourceId: string;
    nomSource: string;
    isEntrepot: boolean;
    qteDisponible: number;
    unite: string;
  }>;
  selectedSourceId: string;
  onSelectSource: (id: string) => void;
  qteTransfert: string;
  onChangeQte: (val: string) => void;
  stockSourceDispo: number;
  isQteExcessive: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  getBoutiqueName: (id: string) => string;
}

export const DemandeAcceptForm: React.FC<DemandeAcceptFormProps> = ({
  demande,
  sourcesDisponibles,
  selectedSourceId,
  onSelectSource,
  qteTransfert,
  onChangeQte,
  stockSourceDispo,
  isQteExcessive,
  onSubmit,
  onClose,
  getBoutiqueName,
}) => {
  const optionsSource: DropdownOption[] = sourcesDisponibles.map((src) => ({
    value: src.sourceId,
    label: src.nomSource,
    sublabel: `Stock dispo : ${src.qteDisponible} ${src.unite}`,
    badge: src.isEntrepot ? 'ENTREPÔT' : 'BOUTIQUE',
    icon: src.isEntrepot ? (
      <Warehouse size={16} className="text-blue-600" />
    ) : (
      <Store size={16} className="text-emerald-600" />
    ),
  }));

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Sélecteur source */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Emplacement source d'expédition *
        </label>
        {sourcesDisponibles.length > 0 ? (
          <CustomDropdownSelect
            label="Sélectionner l'emplacement expéditeur"
            menuTitle="Points de stockage avec stock disponible"
            value={selectedSourceId}
            onChange={onSelectSource}
            options={optionsSource}
            icon={<Truck size={16} />}
          />
        ) : (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0 text-amber-600" />
            <span>Aucun stock physique répertorié pour ce tissu hors boutique demandante.</span>
          </div>
        )}
      </div>

      {/* Quantité validée */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-xs font-semibold text-gray-700">
            Quantité à expédier ({demande.unite || 'm'}) *
          </label>
          {stockSourceDispo > 0 && (
            <span className="text-[11px] text-gray-500">
              Dispo à la source : <strong className="text-blue-700">{stockSourceDispo} {demande.unite || 'm'}</strong>
            </span>
          )}
        </div>
        <input
          type="number"
          min="1"
          step="0.5"
          required
          value={qteTransfert}
          onChange={(e) => onChangeQte(e.target.value)}
          placeholder={`Demande initiale : ${demande.quantite}`}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold transition-colors focus:outline-none ${
            isQteExcessive
              ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500'
              : 'border-gray-200 bg-white text-gray-900 focus:border-blue-500'
          }`}
        />
        {isQteExcessive && (
          <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
            <AlertTriangle size={12} />
            Quantité supérieure au stock disponible chez l'expéditeur ({stockSourceDispo} {demande.unite || 'm'}).
          </p>
        )}
      </div>

      {/* Récapitulatif transfert */}
      <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-1">
        <div className="font-semibold flex items-center gap-1.5">
          <Truck size={14} className="text-blue-600" />
          <span>Itinéraire du transfert :</span>
        </div>
        <div className="text-[11px] text-gray-600 pl-5">
          Origine : <strong className="text-gray-800">{getBoutiqueName(selectedSourceId) || 'Non sélectionné'}</strong>
          <br />
          Destination : <strong className="text-gray-800">{getBoutiqueName(demande.boutique_demande)}</strong>
        </div>
      </div>

      {/* Boutons actions */}
      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={!selectedSourceId || isQteExcessive || parseFloat(qteTransfert) <= 0}
          className="flex-[2] flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
        >
          <CheckCircle2 size={15} />
          <span>Valider et expédier</span>
        </button>
      </div>
    </form>
  );
};

export default DemandeAcceptForm;
