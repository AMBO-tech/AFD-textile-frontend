import React from 'react';
import { Search, ChevronLeft, Package } from 'lucide-react';



interface SalesCatalogProps {
  categories: Categorie[];
  produits: Produit[];
  categorieChoisie: string | null;
  onSelectCategorie: (cat: string | null) => void;
  searchProd: string;
  onSearchChange: (v: string) => void;
  onSelectProduit: (prod: Produit) => void;
}

export const SalesCatalog: React.FC<SalesCatalogProps> = ({
  categories,
  produits,
  categorieChoisie,
  onSelectCategorie,
  searchProd,
  onSearchChange,
  onSelectProduit,
}) => {
  // Catégories qui possèdent au moins un produit disponible
  const categoriesDisponibles = categories.filter((c) =>
    produits.some((p) => p.categorie === c.nom && p.quantite > 0)
  );

  const produitsFiltres = produits.filter(
    (p) =>
      (!categorieChoisie || p.categorie === categorieChoisie) &&
      (p.nom.toLowerCase().includes(searchProd.toLowerCase()) ||
        p.categorie.toLowerCase().includes(searchProd.toLowerCase()) ||
        p.couleur.toLowerCase().includes(searchProd.toLowerCase()))
  );

  return (
    <div className="space-y-3">
      {/* Si aucune catégorie choisie, afficher la grille des catégories */}
      {!categorieChoisie ? (
        <div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            1. Choisissez un type de tissu
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {categoriesDisponibles.map((cat) => {
              const count = produits.filter((p) => p.categorie === cat.nom && p.quantite > 0).length;

              return (
                <button
                  key={cat.nom}
                  onClick={() => onSelectCategorie(cat.nom)}
                  className="p-3 rounded-2xl border border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm transition-all flex flex-col items-center text-center group"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden mb-2 bg-gray-100 border border-gray-100">
                    <img
                      src={cat.photo}
                      alt={cat.nom}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <span className="font-semibold text-gray-900 text-sm">{cat.nom}</span>
                  <span className="text-[11px] text-gray-400 mt-0.5">
                    {count} modèle{count > 1 ? 's' : ''} en stock
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Modèles dans la catégorie sélectionnée */
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <button
              onClick={() => onSelectCategorie(null)}
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              <ChevronLeft size={16} />
              Toutes les catégories
            </button>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800">
              {categorieChoisie}
            </span>
          </div>

          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchProd}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={`Rechercher dans ${categorieChoisie}...`}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {produitsFiltres.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-xs text-gray-400">
                Aucun modèle disponible dans cette sélection.
              </div>
            ) : (
              produitsFiltres.map((prod) => (
                <button
                  key={prod.id}
                  onClick={() => onSelectProduit(prod)}
                  className="p-3 rounded-xl border border-gray-100 bg-white hover:border-blue-200 hover:shadow-xs flex items-center justify-between text-left transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-11 h-11 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={prod.photo} alt={prod.nom} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 text-xs truncate group-hover:text-blue-600">
                        {prod.nom}
                      </div>
                      <div className="text-[11px] text-gray-500 truncate">{prod.couleur}</div>
                      <div className="text-[10px] text-gray-400">
                        Stock : <span className="font-medium text-gray-700">{prod.quantite} {prod.unite}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 pl-2">
                    <div className="font-bold text-gray-900 text-xs">
                      {formatMontant(prod.prix)}
                    </div>
                    <div className="text-[10px] text-gray-400">par {prod.unite}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesCatalog;
