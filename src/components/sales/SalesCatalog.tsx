import { formatMontant } from '@/utils/format';
import React from 'react';
import { Search, ChevronLeft } from 'lucide-react';
import type { PosProduit } from './types';
import { LIBELLES_UNITE } from '../../features/pos/pricing';
import FabricImage from '../ui/FabricImage';
import SquareCard, { Pastille } from '../ui/SquareCard';
import CategoryTile from '../ui/CategoryTile';
import { GRILLE_TUILES } from '../ui/fabricOption';

interface SalesCatalogProps {
  categories: { id: string; nom: string }[];
  produits: PosProduit[];
  isLoading: boolean;
  categorieChoisie: string | null;
  onSelectCategorie: (categorieId: string | null) => void;
  searchProd: string;
  onSearchChange: (v: string) => void;
  onSelectProduit: (prod: PosProduit) => void;
}

const couleurStock = (q: number) => (q < 10 ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white');

/**
 * Catalogue de la caisse en tuiles carrées (photo sur 88 %) : d'abord les catégories qui ont du
 * stock, puis leurs tissus, les plus disponibles d'abord, avec prix et stock en pastilles.
 */
export const SalesCatalog: React.FC<SalesCatalogProps> = ({
  categories,
  produits,
  isLoading,
  categorieChoisie,
  onSelectCategorie,
  searchProd,
  onSearchChange,
  onSelectProduit,
}) => {
  const enStock = produits.filter((p) => p.quantite > 0);
  const categorieActive = categories.find((c) => c.id === categorieChoisie);
  const categoriesDisponibles = categories.filter((c) => enStock.some((p) => p.categorieId === c.id));

  const recherche = searchProd.trim().toLowerCase();
  const produitsFiltres = enStock
    .filter(
      (p) =>
        p.categorieId === categorieChoisie &&
        (p.nom.toLowerCase().includes(recherche) || p.reference.toLowerCase().includes(recherche)),
    )
    .sort((a, b) => b.quantite - a.quantite || a.nom.localeCompare(b.nom));

  if (isLoading) {
    return <div className="text-center py-10 text-xs text-gray-400">Chargement du stock…</div>;
  }

  return (
    <div className="@container space-y-3">
      {!categorieChoisie ? (
        <div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">1. Choisissez un type de tissu</div>
          {categoriesDisponibles.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400">Aucun tissu en stock dans cette boutique.</div>
          ) : (
            <div className={GRILLE_TUILES}>
              {categoriesDisponibles.map((cat) => {
                const tissus = enStock.filter((p) => p.categorieId === cat.id);
                return (
                  <CategoryTile
                    key={cat.id}
                    nom={cat.nom}
                    couvertures={tissus.map((t) => ({ id: t.id, nom: t.nom, photoUrl: t.photo }))}
                    detail={`${tissus.length} modèle${tissus.length > 1 ? 's' : ''} en stock`}
                    onClick={() => onSelectCategorie(cat.id)}
                  />
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <button
              onClick={() => onSelectCategorie(null)}
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              <ChevronLeft size={16} />
              Toutes les catégories
            </button>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800">{categorieActive?.nom}</span>
          </div>

          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchProd}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={`Rechercher dans ${categorieActive?.nom ?? 'la catégorie'}...`}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          {produitsFiltres.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400">Aucun modèle disponible dans cette sélection.</div>
          ) : (
            <div className={GRILLE_TUILES}>
              {produitsFiltres.map((prod) => (
                <SquareCard
                  key={prod.id}
                  onClick={() => onSelectProduit(prod)}
                  titre={prod.nom}
                  infobulle={`${prod.nom} — ${prod.reference} • ${formatMontant(prod.prix)} par ${LIBELLES_UNITE[prod.unite]}`}
                  visuel={<FabricImage src={prod.photo} nom={prod.nom} />}
                  hautDroite={
                    <Pastille className="bg-white/90 text-gray-900">
                      {formatMontant(prod.prix)} / {LIBELLES_UNITE[prod.unite]}
                    </Pastille>
                  }
                  basGauche={<Pastille>{prod.reference}</Pastille>}
                  basDroite={
                    <Pastille className={couleurStock(prod.quantite)}>
                      {prod.quantite} {LIBELLES_UNITE[prod.unite]}
                    </Pastille>
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SalesCatalog;
