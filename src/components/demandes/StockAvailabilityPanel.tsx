import React, { useMemo, useState } from 'react';
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Search, Layers } from 'lucide-react';
import type { Location } from '@/types/locations';
import { useStockLevelsQuery } from '../../hooks/queries/useStocksQuery';
import { useCategoriesQuery } from '../../hooks/queries/useProductsQuery';
import SelectField from '../ui/SelectField';
import FabricTile from '../ui/FabricTile';
import { GRILLE_TUILES, trierParDisponibilite, type TriDisponibilite } from '../ui/fabricOption';
import { optionsEmplacements } from '../ui/locationOptions';

/** Plafond imposé par l'API sur les listes paginées. */
const API_PAGE_MAX = 100;

interface StockAvailabilityPanelProps {
  emplacements: Location[];
  /** Un tissu touché ouvre un nouveau transfert depuis son emplacement. */
  onTransferer: (locationId: string) => void;
}

/** Stock du réseau ou d'un emplacement, trié par disponibilité, en tuiles. */
export const StockAvailabilityPanel: React.FC<StockAvailabilityPanelProps> = ({ emplacements, onTransferer }) => {
  const [locationId, setLocationId] = useState('');
  const [tri, setTri] = useState<TriDisponibilite>('asc');
  const [categorieId, setCategorieId] = useState('');
  const [recherche, setRecherche] = useState('');

  const { data: res, isLoading } = useStockLevelsQuery({ locationId: locationId || undefined, limit: API_PAGE_MAX });
  const { data: categories = [] } = useCategoriesQuery();
  const nomsCategories = useMemo(() => new Map(categories.map((c) => [c.id, c.nom])), [categories]);

  const lignes = useMemo(
    () =>
      (res?.data ?? []).map((s) => ({
        cle: s.id,
        locationId: s.locationId,
        locationNom: s.locationNom,
        enAlerte: s.estEnAlerte,
        option: {
          produitId: s.produitId,
          nom: s.produitNom,
          reference: s.produitReference,
          categorieId: s.categorieId ?? '',
          categorieNom: nomsCategories.get(s.categorieId ?? '') ?? 'Sans catégorie',
          photoUrl: s.produitPhotoUrl,
          disponible: s.quantite,
          unite: s.uniteStockage,
        },
      })),
    [res, nomsCategories],
  );

  const q = recherche.trim().toLowerCase();
  const filtrees = lignes.filter(
    (l) =>
      (!categorieId || l.option.categorieId === categorieId) &&
      (!q || `${l.option.nom} ${l.option.reference} ${l.locationNom}`.toLowerCase().includes(q)),
  );
  const triees = trierParDisponibilite(
    filtrees.map((l) => ({ ...l, disponible: l.option.disponible, nom: l.option.nom })),
    tri,
  );
  const categoriesPresentes = [...new Map(lignes.map((l) => [l.option.categorieId, l.option.categorieNom])).entries()];
  const alertes = lignes.filter((l) => l.enAlerte).length;

  return (
    <div className="@container space-y-3">
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-xs grid grid-cols-1 @2xl:grid-cols-[minmax(0,1fr)_auto] gap-3 items-end">
        <SelectField
          label="Emplacement"
          value={locationId}
          onChange={setLocationId}
          options={[
            { value: '', label: 'Tous les emplacements', description: 'Entrepôts et boutiques', icon: <Layers size={16} /> },
            ...optionsEmplacements(emplacements),
          ]}
        />
        <div className="flex gap-1 p-1 bg-gray-100/90 rounded-xl">
          {(
            [
              ['asc', 'Moins disponibles', ArrowUpNarrowWide],
              ['desc', 'Plus disponibles', ArrowDownWideNarrow],
            ] as const
          ).map(([id, label, Icone]) => (
            <button
              key={id}
              onClick={() => setTri(id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap ${
                tri === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              <Icone size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un tissu ou un emplacement…"
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 bg-white text-sm"
          />
        </div>
        <span className="text-xs text-gray-500 shrink-0">
          {lignes.length} ligne{lignes.length > 1 ? 's' : ''} de stock
          {alertes > 0 && <span className="ml-1 font-semibold text-rose-600">• {alertes} sous le seuil</span>}
        </span>
      </div>

      {categoriesPresentes.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {[['', 'Toutes'], ...categoriesPresentes].map(([id, nom]) => (
            <button
              key={id || 'toutes'}
              onClick={() => setCategorieId(id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold border ${
                categorieId === id ? 'bg-[#0F3D5E] text-white border-[#0F3D5E]' : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {nom}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 text-sm text-gray-400">Chargement du stock…</div>
      ) : triees.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 text-sm text-gray-400">Aucun stock ne correspond.</div>
      ) : (
        <>
          <p className="text-[11px] text-gray-400">Touchez un tissu pour préparer un transfert depuis son emplacement.</p>
          <div className={GRILLE_TUILES}>
            {triees.map((l) => (
              <FabricTile
                key={l.cle}
                option={l.option}
                onClick={() => onTransferer(l.locationId)}
                sousTitre={locationId ? l.option.reference : l.locationNom}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default StockAvailabilityPanel;
