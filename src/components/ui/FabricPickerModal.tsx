import React, { useMemo, useState } from 'react';
import { X, ChevronLeft, Search } from 'lucide-react';
import CategoryTile from './CategoryTile';
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
                  const total = c.tissus.reduce((somme, t) => somme + t.disponible, 0);
                  return (
                    <CategoryTile
                      key={c.id}
                      nom={c.nom}
                      couvertures={c.tissus.map((t) => ({ id: t.produitId, nom: t.nom, photoUrl: t.photoUrl }))}
                      detail={`${c.tissus.length} tissu${c.tissus.length > 1 ? 's' : ''}${total > 0 ? ` • ${Math.round(total)} en stock` : ''}`}
                      onClick={() => setCategorieId(c.id)}
                    />
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
