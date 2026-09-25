import React, { useMemo, useState } from 'react';
import { X, ChevronLeft, Search, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import FabricImage from './FabricImage';
import FabricTile from './FabricTile';
import { GRILLE_TUILES, trierParDisponibilite, type FabricOption, type TriDisponibilite } from './fabricOption';

export type { FabricOption, TriDisponibilite } from './fabricOption';
export { libelleQuantite } from './fabricOption';

interface FabricPickerModalProps {
  options: FabricOption[];
  onChoisir: (option: FabricOption) => void;
  onClose: () => void;
  titre?: string;
  /** « asc » : les moins disponibles d'abord (réassort) ; « desc » : les plus disponibles d'abord (vente). */
  tri?: TriDisponibilite;
  /** Tissus déjà ajoutés (coche sur la tuile). */
  selectionnes?: string[];
  /** Montrer aussi les tissus à 0 (demande de réassort). */
  inclureRuptures?: boolean;
  /** Libellé de la quantité affichée sur les tuiles. */
  libelleDispo?: string;
}

/**
 * Choix d'un tissu en deux temps, en tuiles carrées dont l'image occupe l'essentiel :
 * 1. la catégorie, 2. le tissu, trié par disponibilité.
 */
export const FabricPickerModal: React.FC<FabricPickerModalProps> = ({
  options,
  onChoisir,
  onClose,
  titre = 'Choisir un tissu',
  tri = 'desc',
  selectionnes = [],
  inclureRuptures = false,
  libelleDispo = 'dispo',
}) => {
  const [categorieId, setCategorieId] = useState<string | null>(null);
  const [recherche, setRecherche] = useState('');

  const visibles = useMemo(
    () => options.filter((o) => inclureRuptures || o.disponible > 0),
    [options, inclureRuptures],
  );

  const categories = useMemo(() => {
    const parId = new Map<string, { id: string; nom: string; tissus: FabricOption[] }>();
    for (const o of visibles) {
      const c = parId.get(o.categorieId) ?? { id: o.categorieId, nom: o.categorieNom, tissus: [] };
      c.tissus.push(o);
      parId.set(o.categorieId, c);
    }
    return [...parId.values()].sort((a, b) => a.nom.localeCompare(b.nom));
  }, [visibles]);

  const q = recherche.trim().toLowerCase();
  const tissus = useMemo(() => {
    const base = q
      ? visibles.filter((o) => `${o.nom} ${o.reference} ${o.categorieNom}`.toLowerCase().includes(q))
      : visibles.filter((o) => o.categorieId === categorieId);
    return trierParDisponibilite(base, tri);
  }, [visibles, categorieId, q, tri]);

  const categorie = categories.find((c) => c.id === categorieId);
  const niveauTissus = Boolean(categorieId) || Boolean(q);

  return (
    <div className="fixed inset-0 z-[70] flex items-stretch sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-50 w-full sm:max-w-4xl h-full sm:h-[88vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-100 p-3 sm:p-4 space-y-3">
          <div className="flex items-center gap-2">
            {niveauTissus && (
              <button
                onClick={() => {
                  setCategorieId(null);
                  setRecherche('');
                }}
                className="w-9 h-9 shrink-0 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                aria-label="Retour aux catégories"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-gray-900 text-base truncate">{titre}</h3>
              <p className="text-[11px] text-gray-400 truncate">
                {q
                  ? `Résultats pour « ${recherche.trim()} »`
                  : categorie
                    ? `${categorie.nom} • ${tri === 'asc' ? 'les moins disponibles d’abord' : 'les plus disponibles d’abord'}`
                    : '1. Choisissez une catégorie'}
              </p>
            </div>
            <button onClick={onClose} className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100" aria-label="Fermer">
              <X size={18} />
            </button>
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher un tissu dans toutes les catégories…"
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>
        </div>

        <div className="@container flex-1 overflow-y-auto p-3 sm:p-4">
          {!niveauTissus ? (
            categories.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-400">Aucun tissu disponible ici.</div>
            ) : (
              <div className={GRILLE_TUILES}>
                {categories.map((c) => {
                  const total = c.tissus.reduce((s, t) => s + t.disponible, 0);
                  const couvertures = c.tissus.slice(0, 4);
                  return (
                    <button
                      key={c.id}
                      onClick={() => setCategorieId(c.id)}
                      className="group aspect-square rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-md hover:border-blue-200 overflow-hidden flex flex-col text-left transition-all"
                    >
                      <div
                        className={cn(
                          'h-[76%] w-full grid gap-px bg-gray-100',
                          couvertures.length > 1 ? 'grid-cols-2' : 'grid-cols-1',
                          couvertures.length > 2 ? 'grid-rows-2' : 'grid-rows-1',
                        )}
                      >
                        {couvertures.map((t, i) => (
                          <div key={t.produitId} className={cn('h-full min-h-0 overflow-hidden', couvertures.length === 3 && i === 0 && 'row-span-2')}>
                            <FabricImage src={t.photoUrl} nom={t.nom} className="group-hover:scale-105 transition-transform duration-300" />
                          </div>
                        ))}
                      </div>
                      <div className="flex-1 px-2.5 flex flex-col justify-center min-h-0 leading-tight">
                        <span className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{c.nom}</span>
                        <span className="flex items-center gap-1 text-[10px] sm:text-[11px] text-gray-400 truncate">
                          <Layers size={11} /> {c.tissus.length} tissu{c.tissus.length > 1 ? 's' : ''}
                          {total > 0 ? ` • ${Math.round(total)} en stock` : ''}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )
          ) : tissus.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-400">Aucun tissu ne correspond.</div>
          ) : (
            <div className={GRILLE_TUILES}>
              {tissus.map((t) => (
                <FabricTile
                  key={t.produitId}
                  option={t}
                  onClick={() => onChoisir(t)}
                  choisi={selectionnes.includes(t.produitId)}
                  libelleDispo={libelleDispo}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FabricPickerModal;
