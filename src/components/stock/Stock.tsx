import React, { useState, useMemo } from 'react';
import { useMockStore, type Produit } from '../../data/useMockStore';
import StockHeader from './StockHeader';
import StockFilters from './StockFilters';
import StockCategoryGroup from './StockCategoryGroup';
import QuickCategoryModal from './QuickCategoryModal';
import QuickProductModal from './QuickProductModal';
import QuickStockAdjustmentModal from './QuickStockAdjustmentModal';
import StockInWizardModal from './StockInWizardModal';

interface StockProps {
  role?: 'gerant' | 'boutiquier';
  boutiqueId?: string;
  onNavigate?: (s: string) => void;
}

export const Stock: React.FC<StockProps> = ({
  role = 'gerant',
  boutiqueId = 'b1',
  onNavigate,
}) => {
  const {
    produits,
    categories,
    boutiques,
    adjustStock,
    addProduit,
    updateProduit,
    addCategorie,
  } = useMockStore();

  const [search, setSearch] = useState('');
  const [filtreEmplacement, setFiltreEmplacement] = useState<string>(
    role === 'boutiquier' ? boutiqueId : 'tous'
  );
  const [filtreCat, setFiltreCat] = useState<string>('toutes');
  const [ouvertes, setOuvertes] = useState<Set<string>>(
    new Set(categories.map((c) => c.nom))
  );

  // Modals state
  const [showMiseEnStock, setShowMiseEnStock] = useState(false);
  const [showQuickCatModal, setShowQuickCatModal] = useState(false);
  const [showQuickProdModal, setShowQuickProdModal] = useState(false);
  const [modalEntreeRapide, setModalEntreeRapide] = useState<Produit | null>(null);

  // Filtrage selon le rôle et les critères
  const produitsFiltres = useMemo(() => {
    return produits.filter((p) => {
      // Filtre emplacement selon le rôle
      if (role === 'boutiquier') {
        if (p.boutique !== boutiqueId) return false;
      } else if (filtreEmplacement !== 'tous') {
        if (p.boutique !== filtreEmplacement) return false;
      }

      // Filtre catégorie
      if (filtreCat !== 'toutes' && p.categorie !== filtreCat) {
        return false;
      }

      // Recherche texte
      if (search.trim()) {
        const query = search.toLowerCase();
        return (
          p.nom.toLowerCase().includes(query) ||
          p.categorie.toLowerCase().includes(query) ||
          p.couleur.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [produits, role, boutiqueId, filtreEmplacement, filtreCat, search]);

  const toggleCategory = (catNom: string) => {
    setOuvertes((prev) => {
      const next = new Set(prev);
      if (next.has(catNom)) next.delete(catNom);
      else next.add(catNom);
      return next;
    });
  };

  // Catégories visibles avec leurs produits associés
  const categoriesAffichees = useMemo(() => {
    return categories
      .filter((cat) => (filtreCat === 'toutes' ? true : cat.nom === filtreCat))
      .map((cat) => ({
        categorie: cat,
        produits: produitsFiltres.filter((p) => p.categorie === cat.nom),
      }))
      .filter((group) => group.produits.length > 0 || search === '');
  }, [categories, produitsFiltres, filtreCat, search]);

  return (
    <div className="space-y-4">
      {/* En-tête avec métriques */}
      <StockHeader
        produits={produitsFiltres}
        role={role}
        onOpenMiseEnStock={() => setShowMiseEnStock(true)}
      />

      {/* Barre de filtres et recherche */}
      <StockFilters
        search={search}
        onSearchChange={setSearch}
        filtreEmplacement={filtreEmplacement}
        onEmplacementChange={setFiltreEmplacement}
        filtreCat={filtreCat}
        onCatChange={setFiltreCat}
        categories={categories}
        boutiques={boutiques}
        role={role}
        boutiqueId={boutiqueId}
      />

      {/* Liste des catégories et articles */}
      <div className="space-y-3">
        {categoriesAffichees.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="text-gray-400 text-sm">
              Aucun produit ne correspond à votre recherche.
            </div>
          </div>
        ) : (
          categoriesAffichees.map(({ categorie, produits: prodsCat }) => (
            <StockCategoryGroup
              key={categorie.nom}
              categorie={categorie}
              produits={prodsCat}
              isOuverte={ouvertes.has(categorie.nom)}
              onToggle={() => toggleCategory(categorie.nom)}
              onEntreeRapide={(prod) => setModalEntreeRapide(prod)}
              onVenteRapide={(id) => onNavigate?.('ventes')}
            />
          ))
        )}
      </div>

      {/* Modals modulaires */}
      <StockInWizardModal
        isOpen={showMiseEnStock}
        onClose={() => setShowMiseEnStock(false)}
        categories={categories}
        produitsCatalogue={produits}
        boutiques={boutiques}
        role={role}
        boutiqueId={boutiqueId}
        onOpenNewCat={() => setShowQuickCatModal(true)}
        onOpenNewProd={() => setShowQuickProdModal(true)}
        onSubmit={({ produitId, quantite, prix, unite, seuil, emplacement }) => {
          // Si le produit existe déjà à cet emplacement, on ajuste, sinon on met à jour
          const existing = produits.find((p) => p.id === produitId);
          if (existing && existing.boutique === emplacement) {
            adjustStock(produitId, quantite, 'Mise en stock wizard');
            updateProduit(produitId, { prix, unite, seuil });
          } else if (existing) {
            // Créer une déclinaison pour cette boutique
            addProduit({
              nom: existing.nom,
              categorie: existing.categorie,
              couleur: existing.couleur,
              prix,
              quantite,
              unite,
              pieces: Math.ceil(quantite / 20),
              boutique: emplacement,
              seuil,
              photo: existing.photo,
            });
          }
        }}
      />

      <QuickCategoryModal
        isOpen={showQuickCatModal}
        onClose={() => setShowQuickCatModal(false)}
        onSubmit={(cat) => addCategorie(cat)}
      />

      <QuickProductModal
        isOpen={showQuickProdModal}
        onClose={() => setShowQuickProdModal(false)}
        categories={categories}
        onSubmit={(prod) => {
          addProduit({
            ...prod,
            prix: 4000,
            quantite: 0,
            unite: 'mètre',
            pieces: 0,
            boutique: role === 'boutiquier' ? boutiqueId : 'entrepot',
            seuil: 15,
          });
        }}
      />

      <QuickStockAdjustmentModal
        produit={modalEntreeRapide}
        onClose={() => setModalEntreeRapide(null)}
        onSubmit={(prodId, qte, motif) => {
          adjustStock(prodId, qte, motif);
        }}
      />
    </div>
  );
};

export default Stock;
