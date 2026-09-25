import React, { useEffect, useState } from 'react';
import { Plus, Search, Package, FolderPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import type { Produit } from '@/types/products';
import type { ProductStatus } from '@/types/enums';
import { useProductsQuery, useCategoriesQuery, useArchiveProductMutation } from '../../hooks/queries/useProductsQuery';
import { getErrorMessage } from '../../services/api';
import ProductCard from './ProductCard';
import ProductFormModal from './ProductFormModal';
import NewCategoryModal from './NewCategoryModal';
import { isGerant, type ProductsProps } from './types';
import { GRILLE_TUILES } from '../ui/fabricOption';

/** Plafond imposé par l'API sur les listes paginées. */
const API_PAGE_MAX = 100;
const DELAI_RECHERCHE_MS = 300;

/** Catalogue des tissus : consultation pour tous, création / modification / archivage pour le gérant. */
export const Products: React.FC<ProductsProps> = ({ role }) => {
  const gerant = isGerant(role);
  const [saisie, setSaisie] = useState('');
  const [recherche, setRecherche] = useState('');
  const [categorieId, setCategorieId] = useState('');
  const [statut, setStatut] = useState<ProductStatus>('ACTIF');
  const [page, setPage] = useState(1);
  const [formulaire, setFormulaire] = useState<{ produit: Produit | null } | null>(null);
  const [showCategorie, setShowCategorie] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setRecherche(saisie.trim());
      setPage(1);
    }, DELAI_RECHERCHE_MS);
    return () => clearTimeout(t);
  }, [saisie]);

  const { data: categories = [], isLoading: chargementCategories } = useCategoriesQuery();
  const { data: res, isLoading, isError, error } = useProductsQuery({
    statut,
    categorieId: categorieId || undefined,
    search: recherche || undefined,
    page,
    limit: API_PAGE_MAX,
  });
  const produits = res?.data ?? [];
  const total = res?.total ?? res?.meta?.total ?? produits.length;
  const totalPages = res?.totalPages ?? 1;
  const { mutateAsync: archiver } = useArchiveProductMutation();

  const choisirCategorie = (id: string) => {
    setCategorieId(id);
    setPage(1);
  };

  const archiverProduit = async (p: Produit) => {
    if (!window.confirm(`Archiver « ${p.nom} » ? Il ne sera plus proposé à la vente ni en mise en stock.`)) return;
    try {
      await archiver(p.id);
      toast.success(`« ${p.nom} » archivé.`);
    } catch (e) {
      toast.error(getErrorMessage(e, 'L’archivage a échoué.'));
    }
  };

  const aucuneCategorie = !chargementCategories && categories.length === 0;

  return (
    <div className="@container space-y-4">
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Package size={20} />
          </div>
          <div>
            <h1 className="font-display font-bold text-gray-900 text-xl sm:text-2xl">Produits</h1>
            <p className="text-xs sm:text-sm text-gray-500">Catalogue des tissus : référence, photo, unité et prix</p>
          </div>
        </div>
        {gerant && (
          <div className="flex gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShowCategorie(true)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-semibold text-xs text-gray-700 border border-gray-200 hover:bg-gray-50"
            >
              <FolderPlus size={16} /> Catégorie
            </button>
            <button
              onClick={() => setFormulaire({ produit: null })}
              disabled={aucuneCategorie}
              title={aucuneCategorie ? 'Créez d’abord une catégorie' : undefined}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white shadow-sm disabled:opacity-50"
              style={{ background: '#0F3D5E' }}
            >
              <Plus size={16} /> Nouveau tissu
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={saisie}
            onChange={(e) => setSaisie(e.target.value)}
            placeholder="Rechercher un nom, une référence, une couleur…"
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 bg-white text-sm"
          />
        </div>
        <div className="flex gap-1 p-1 bg-gray-100/90 rounded-xl">
          {(['ACTIF', 'INACTIF'] as ProductStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatut(s);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${statut === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
            >
              {s === 'ACTIF' ? 'Actifs' : 'Archivés'}
            </button>
          ))}
        </div>
      </div>

      {categories.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {[{ id: '', nom: 'Toutes' }, ...categories].map((c) => (
            <button
              key={c.id || 'toutes'}
              onClick={() => choisirCategorie(c.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold border ${
                categorieId === c.id ? 'bg-[#0F3D5E] text-white border-[#0F3D5E]' : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {c.nom}
            </button>
          ))}
        </div>
      )}

      {isError ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-red-100 text-sm text-red-600">
          {getErrorMessage(error, 'Le catalogue n’a pas pu être chargé.')}
        </div>
      ) : isLoading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 text-sm text-gray-400">Chargement…</div>
      ) : produits.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 space-y-2">
          <Package size={32} className="mx-auto text-gray-300" />
          <p className="text-sm text-gray-500">
            {recherche || categorieId || statut === 'INACTIF'
              ? 'Aucun tissu ne correspond à ces filtres.'
              : aucuneCategorie
                ? 'Catalogue vide : commencez par créer une catégorie, puis ajoutez vos tissus.'
                : 'Catalogue vide : ajoutez votre premier tissu.'}
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400">
            {total} tissu{total > 1 ? 's' : ''}
          </p>
          <div className={GRILLE_TUILES}>
            {produits.map((p) => (
              <ProductCard
                key={p.id}
                produit={p}
                gerant={gerant}
                onEdit={() => setFormulaire({ produit: p })}
                onArchive={() => archiverProduit(p)}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 text-xs">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="p-2 rounded-lg border border-gray-200 disabled:opacity-40" aria-label="Page précédente">
                <ChevronLeft size={14} />
              </button>
              <span>
                Page {page} / {totalPages}
              </span>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="p-2 rounded-lg border border-gray-200 disabled:opacity-40" aria-label="Page suivante">
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}

      {gerant && formulaire && (
        <ProductFormModal
          key={formulaire.produit?.id ?? 'nouveau'}
          produit={formulaire.produit}
          categorieParDefaut={categorieId || undefined}
          onClose={() => setFormulaire(null)}
        />
      )}
      {gerant && showCategorie && (
        <NewCategoryModal onClose={() => setShowCategorie(false)} onCreated={(c) => choisirCategorie(c.id)} />
      )}
    </div>
  );
};

export default Products;
