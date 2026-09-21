import React from 'react';
import { Warehouse, Store, Ruler } from 'lucide-react';
import CustomDropdownSelect, { type DropdownOption } from '../../../components/ui/CustomDropdownSelect';
import type { Produit, Boutique } from '../../../data/useMockStore';

const UNITES_STOCK = ['mètre', 'yard', 'kilo', 'rouleau'] as const;

interface StockInConfigStepProps {
  produitChoisi: Produit;
  role: 'gerant' | 'boutiquier';
  boutiqueId?: string;
  boutiques: Boutique[];
  optionsEmplacement: DropdownOption[];
  form: {
    emplacement: string;
    quantite: string;
    unite: typeof UNITES_STOCK[number];
    prix: string;
    prixMinimal: string;
    pieces: string;
    seuil: string;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

export const StockInConfigStep: React.FC<StockInConfigStepProps> = ({
  produitChoisi,
  role,
  boutiqueId,
  boutiques,
  optionsEmplacement,
  form,
  setForm,
  onSubmit,
  onBack,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-3.5">
      {/* Carte résumé produit choisi */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white flex-shrink-0">
          <img src={produitChoisi.photo} alt={produitChoisi.nom} className="w-full h-full object-cover" />
        </div>
        <div>
          <div className="font-bold text-gray-900 text-sm">{produitChoisi.nom}</div>
          <div className="text-xs text-blue-700 font-medium">
            {produitChoisi.categorie} • {produitChoisi.couleur}
          </div>
        </div>
      </div>

      {/* Emplacement destination */}
      {role === 'gerant' ? (
        <div>
          <CustomDropdownSelect
            label="Emplacement récepteur"
            menuTitle="Point de stockage de destination"
            value={form.emplacement}
            onChange={(val) => setForm((f: any) => ({ ...f, emplacement: val }))}
            options={optionsEmplacement}
            icon={<Warehouse size={16} />}
          />
          <p className="text-[11px] text-gray-400 mt-1 pl-0.5">
            Indiquez précisément quel point de vente ou entrepôt réceptionne ce stock physique.
          </p>
        </div>
      ) : (
        (() => {
          const b = boutiques.find((item) => item.id === boutiqueId);
          return (
            <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center gap-2.5 text-xs text-blue-900">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Store size={16} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-blue-600 block leading-tight">
                  Point de vente récepteur (Votre boutique)
                </span>
                <span className="font-bold text-sm text-gray-900 truncate block">
                  {b?.nom || 'Boutique Locale'}
                </span>
                <span className="text-[11px] text-gray-500 block">
                  {b?.lieu || 'Affectation'} • Ce métrage sera immédiatement vendable en caisse
                </span>
              </div>
            </div>
          );
        })()
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Quantité reçue *
          </label>
          <input
            type="number"
            required
            min="1"
            value={form.quantite}
            onChange={(e) => setForm({ ...form, quantite: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100/60"
          />
        </div>
        <div>
          <CustomDropdownSelect
            label="Unité de mesure"
            value={form.unite}
            onChange={(val) =>
              setForm({ ...form, unite: val as typeof UNITES_STOCK[number] })
            }
            icon={<Ruler size={15} />}
            menuTitle="Unité de stock"
            options={UNITES_STOCK.map((u) => ({
              value: u,
              label: u,
              badge: 'Unité',
              icon: <Ruler size={14} className="text-blue-500" />,
            }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Prix unitaire de vente (FCFA) *
          </label>
          <input
            type="number"
            required
            value={form.prix}
            onChange={(e) => {
              const newPrix = e.target.value;
              const num = parseFloat(newPrix);
              setForm((prev: any) => ({
                ...prev,
                prix: newPrix,
                prixMinimal:
                  !isNaN(num) &&
                  (!prev.prixMinimal ||
                    prev.prixMinimal ===
                      Math.round((parseFloat(prev.prix) || 0) * 0.9).toString())
                    ? Math.round(num * 0.9).toString()
                    : prev.prixMinimal,
              }));
            }}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Prix plancher minimal (FCFA)
          </label>
          <input
            type="number"
            value={form.prixMinimal}
            onChange={(e) => setForm({ ...form, prixMinimal: e.target.value })}
            placeholder="Prix min négociable"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Nombre de pièces / rouleaux
          </label>
          <input
            type="number"
            value={form.pieces}
            onChange={(e) => setForm({ ...form, pieces: e.target.value })}
            placeholder="Ex: 5"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Seuil d'alerte critique
          </label>
          <input
            type="number"
            value={form.seuil}
            onChange={(e) => setForm({ ...form, seuil: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
        >
          Retour
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-sm hover:opacity-95 cursor-pointer"
          style={{ background: '#0F3D5E' }}
        >
          Valider la mise en stock
        </button>
      </div>
    </form>
  );
};

export default StockInConfigStep;
