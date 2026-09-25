import { formatMontant } from '@/utils/format';
import React, { useMemo, useState } from 'react';
import { Search, PackagePlus, AlertTriangle, ClipboardCheck, ChevronDown, ChevronRight, Boxes } from 'lucide-react';
import type { StockLevel } from '@/types/stocks';
import StockEntryModal from './StockEntryModal';
import StockAdjustModal from './StockAdjustModal';
import { LIBELLES_UNITE } from '../../features/pos/pricing';
import { useStockLevelsQuery } from '../../hooks/queries/useStocksQuery';
import { useLocationsListQuery } from '../../hooks/queries/useLocationsQuery';
import { useCategoriesQuery } from '../../hooks/queries/useProductsQuery';
import SelectField from '../ui/SelectField';
import { optionsEmplacements } from '../ui/locationOptions';

/** Plafond imposé par l'API sur les listes paginées. */
const API_PAGE_MAX = 100;
const TOUS = 'tous';

interface StockProps {
  role?: string;
  /** Boutique du boutiquier (lecture seule de son stock). */
  boutiqueId?: string | null;
  onNavigate?: (s: string) => void;
}

/** Stocks par emplacement. Gérant : tous les emplacements, mise en stock et inventaire. Boutiquier : sa boutique. */
export const Stock: React.FC<StockProps> = ({ role: rawRole = 'gerant', boutiqueId, onNavigate }) => {
  const isGerant = rawRole === 'OWNER' || rawRole?.toLowerCase() === 'gerant';

  const [search, setSearch] = useState('');
  const [emplacement, setEmplacement] = useState<string>(TOUS);
  const [categorie, setCategorie] = useState<string>(TOUS);
  const [fermees, setFermees] = useState<Set<string>>(new Set());
  const [showEntree, setShowEntree] = useState(false);
  const [stockAAjuster, setStockAAjuster] = useState<StockLevel | null>(null);

  const locationId = isGerant ? (emplacement === TOUS ? undefined : emplacement) : (boutiqueId ?? undefined);

  const { data: locRes } = useLocationsListQuery();
  const emplacements = useMemo(
    () => [...(locRes?.data ?? [])].sort((a, b) => (a.type === b.type ? a.nom.localeCompare(b.nom) : a.type === 'ENTREPOT' ? -1 : 1)),
    [locRes],
  );
  const { data: categories = [] } = useCategoriesQuery();
  const { data: stockRes, isLoading } = useStockLevelsQuery(
    { limit: API_PAGE_MAX, ...(locationId ? { locationId } : {}) },
    { enabled: isGerant || Boolean(boutiqueId) },
  );
  const stocks = stockRes?.data ?? [];

  const recherche = search.trim().toLowerCase();
  const stocksFiltres = stocks.filter(
    (s) =>
      (categorie === TOUS || s.categorieId === categorie) &&
      (!recherche ||
        s.produitNom.toLowerCase().includes(recherche) ||
        s.produitReference.toLowerCase().includes(recherche)),
  );

  const groupes = categories
    .map((c) => ({
      categorie: c,
      lignes: stocksFiltres
        .filter((s) => s.categorieId === c.id)
        .sort((a, b) => a.produitNom.localeCompare(b.produitNom) || a.locationNom.localeCompare(b.locationNom)),
    }))
    .filter((g) => g.lignes.length > 0);

  const nbAlertes = stocksFiltres.filter((s) => s.estEnAlerte).length;
  const valeur = stocksFiltres.reduce((t, s) => t + s.quantite * (s.prixEffectif ?? 0), 0);

  const basculer = (id: string) =>
    setFermees((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display font-bold text-gray-900 text-xl sm:text-2xl">Stocks</h1>
            <p className="text-xs sm:text-sm text-gray-500">
              {isGerant ? 'Entrepôt et boutiques : quantités, prix et alertes' : 'Stock de votre boutique'}
            </p>
          </div>
          {isGerant && (
            <button
              onClick={() => setShowEntree(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white shadow-sm self-start sm:self-auto"
              style={{ background: '#0F3D5E' }}
            >
              <PackagePlus size={16} /> Mise en stock
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-gray-50">
            <div className="text-[11px] text-gray-500">Lignes de stock</div>
            <div className="font-display font-bold text-gray-900">{stocksFiltres.length}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50">
            <div className="text-[11px] text-amber-700">Sous le seuil</div>
            <div className="font-display font-bold text-amber-700">{nbAlertes}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50">
            <div className="text-[11px] text-blue-700">Valeur au prix de vente</div>
            <div className="font-display font-bold text-blue-900 text-sm">{formatMontant(valeur)}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-[2]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un tissu ou une référence…"
            className="w-full pl-9 pr-3 h-10 rounded-xl border border-gray-200 text-xs bg-white"
          />
        </div>
        {isGerant && (
          <SelectField
            size="sm"
            className="flex-1"
            value={emplacement}
            onChange={setEmplacement}
            aria-label="Emplacement"
            options={[{ value: TOUS, label: 'Tous les emplacements' }, ...optionsEmplacements(emplacements)]}
          />
        )}
        <SelectField
          size="sm"
          className="flex-1"
          value={categorie}
          onChange={setCategorie}
          aria-label="Catégorie"
          options={[{ value: TOUS, label: 'Toutes les catégories' }, ...categories.map((c) => ({ value: c.id, label: c.nom }))]}
        />
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 text-sm text-gray-400">Chargement du stock…</div>
      ) : groupes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 text-sm text-gray-400">
          {stocks.length === 0 ? 'Aucun stock à cet emplacement.' : 'Aucun tissu ne correspond à votre recherche.'}
        </div>
      ) : (
        <div className="space-y-3">
          {groupes.map(({ categorie: cat, lignes }) => {
            const ouverte = !fermees.has(cat.id);
            return (
              <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                <button
                  onClick={() => basculer(cat.id)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50/60"
                >
                  <span className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
                    <Boxes size={16} className="text-blue-600" /> {cat.nom}
                    <span className="text-[11px] font-normal text-gray-400">({lignes.length})</span>
                  </span>
                  {ouverte ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                </button>
                {ouverte && (
                  <div className="divide-y divide-gray-50 border-t border-gray-50">
                    {lignes.map((s) => (
                      <div key={s.id} className="px-4 py-2.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img src={s.produitPhotoUrl} alt={s.produitNom} className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-gray-900 truncate">{s.produitNom}</div>
                            <div className="text-[11px] text-gray-400 truncate">
                              {s.produitReference} • {s.locationNom}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <div className={`text-xs font-bold ${s.estEnAlerte ? 'text-red-600' : 'text-gray-900'}`}>
                              {s.estEnAlerte && <AlertTriangle size={12} className="inline mr-1 -mt-0.5" />}
                              {s.quantite} {LIBELLES_UNITE[s.uniteStockage]}
                            </div>
                            <div className="text-[10px] text-gray-400">
                              {formatMontant(s.prixEffectif ?? 0)}/{LIBELLES_UNITE[s.uniteStockage]}
                            </div>
                          </div>
                          {isGerant && (
                            <button
                              onClick={() => setStockAAjuster(s)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                              title="Inventaire / correction"
                            >
                              <ClipboardCheck size={15} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isGerant && showEntree && (
        <StockEntryModal
          isOpen
          onClose={() => setShowEntree(false)}
          emplacements={emplacements}
          onOpenCatalogue={() => {
            setShowEntree(false);
            onNavigate?.('produits');
          }}
        />
      )}

      {isGerant && stockAAjuster && (
        <StockAdjustModal key={stockAAjuster.id} stock={stockAAjuster} onClose={() => setStockAAjuster(null)} />
      )}
    </div>
  );
};

export default Stock;
