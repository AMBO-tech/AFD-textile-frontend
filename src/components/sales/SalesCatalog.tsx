import React from 'react';
import { Search, ChevronLeft, Package } from 'lucide-react';
import type { StockEnriched, Categorie } from '../../data/useMockStore';
import CategoryCard from '../products/CategoryCard';
import ProductCard from '../products/ProductCard';

interface SalesCatalogProps {
  categories: Categorie[];
  produits: StockEnriched[];
  categorieChoisie: string | null;
  onSelectCategorie: (cat: string | null) => void;
  searchProd: string;
  onSearchChange: (v: string) => void;
  onSelectProduit: (prod: StockEnriched) => void;
  role?: 'gerant' | 'boutiquier';
}

export const SalesCatalog: React.FC<SalesCatalogProps> = ({
  categories,
  produits,
  categorieChoisie,
  onSelectCategorie,
  searchProd,
  onSearchChange,
  onSelectProduit,
  role = 'boutiquier',
}) => {
  const query = searchProd.trim().toLowerCase();

  // Produits filtrés selon la catégorie sélectionnée et la recherche
  const produitsFiltres = produits.filter((p) => {
    if (categorieChoisie && p.categorie !== categorieChoisie) {
      return false;
    }
    if (query) {
      const matchNom = p.nom.toLowerCase().includes(query);
      const matchCat = p.categorie.toLowerCase().includes(query);
      const matchCouleur = p.couleur ? p.couleur.toLowerCase().includes(query) : false;
      const matchRef = p.reference ? p.reference.toLowerCase().includes(query) : false;
      return matchNom || matchCat || matchCouleur || matchRef;
    }
    return true;
  });

  // Niveau 1 : Aucune catégorie sélectionnée et pas de recherche active
  // -> Affichage identique à /produits (Grille CategoryCard)
  if (!categorieChoisie && !query) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="font-display font-bold text-gray-900 text-lg">
              Catégories de tissus
            </h2>
            <p className="text-xs text-gray-400">
              Sélectionnez une catégorie pour accéder aux modèles disponibles
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800">
            {categories.length} catégories
          </span>
        </div>

        {/* Barre de recherche directe */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchProd}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher directement un tissu (nom, référence, couleur)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-2xs"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {categories.map((cat) => {
            const count = produits.filter((p) => p.categorie === cat.nom).length;
            return (
              <CategoryCard
                key={cat.nom}
                nom={cat.nom}
                photo={cat.photo}
                productCount={count}
                onClick={() => onSelectCategorie(cat.nom)}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // Niveau 2 : Une catégorie est sélectionnée OU une recherche textuelle est en cours
  // -> Affichage identique à /produits (Grille ProductCard)
  return (
    <div className="space-y-4">
      {/* En-tête retour & titre */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            onSelectCategorie(null);
            onSearchChange('');
          }}
          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors shadow-2xs"
          title="Retour aux catégories"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-bold text-gray-900 text-lg truncate">
            {categorieChoisie ? categorieChoisie : `Recherche : "${searchProd}"`}
          </h2>
          <p className="text-xs text-gray-400">
            {produitsFiltres.length} modèle{produitsFiltres.length !== 1 ? 's' : ''} disponible{produitsFiltres.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Barre de recherche dans la sélection */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchProd}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={
            categorieChoisie
              ? `Rechercher dans ${categorieChoisie}...`
              : 'Rechercher un tissu par nom, référence...'
          }
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-2xs"
        />
      </div>

      {/* Grille de cartes produits identique à /produits */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {produitsFiltres.map((prod) => (
          <ProductCard
            key={prod.id}
            product={prod}
            role={role}
            onClick={() => onSelectProduit(prod)}
          />
        ))}

        {produitsFiltres.length === 0 && (
          <div className="col-span-2 sm:col-span-3 bg-white rounded-2xl p-8 text-center text-gray-400 shadow-sm border border-gray-100">
            <Package size={36} className="mx-auto mb-2 opacity-30 text-gray-400" />
            <p className="text-sm font-medium text-gray-600">Aucun tissu disponible</p>
            <p className="text-xs text-gray-400 mt-1">
              {query
                ? 'Aucun modèle ne correspond à votre recherche.'
                : 'Aucun modèle en stock dans cette sélection pour ce point de vente.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesCatalog;
