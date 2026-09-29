import React, { useState, useMemo } from 'react';
import { toast } from "sonner";
import { useAdjustStockMutation, useExecuteMovementMutation, useStockLevelsQuery } from "../../hooks/queries/useStocksQuery";
import { useProductsQuery, useCategoriesQuery, useCreateProductMutation } from "../../hooks/queries/useProductsQuery";
import { useLocationsListQuery } from "../../hooks/queries/useLocationsQuery";
import type { StockEnriched } from '@/types/stocks'; import type { Produit } from '@/types/products';
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
  const { data: prods } = useProductsQuery();
  const { data: cats } = useCategoriesQuery();
  const { data: locs } = useLocationsListQuery();
  const { data: stks } = useStockLevelsQuery();
  const createProductMutation = useCreateProductMutation();
  const produits = prods?.data || [];
  const categories = cats?.data || [];
  const boutiques = locs?.data || [];
  const stocks = stks?.data || [];
  const addProduit = (p) => createProductMutation.mutateAsync(p);
  const addCategorie = (c) => {};
  const upsertStockItem = (p) => {};
  const adjustStock = () => {};
  const getStocksEnriched = (loc) => stocks.filter((s) => loc === "tous" ? true : s.locationId === loc).map((s) => ({ ...s, nom: s.produitNom, reference: s.produitReference, categorie: s.categorieNom || "N/A", boutiqueId: s.locationId, unite: s.uniteStockage }));

  const [search, setSearch] = useState('');
  const [filtreEmplacement, setFiltreEmplacement] = useState<string>(
    role === 'boutiquier' ? boutiqueId : 'tous'
  );
  const [filtreCat, setFiltreCat] = useState('toutes');

  // CatÃ©gories existantes + celles dÃ©rivÃ©es des produits
  const allCategories = Array.from(
    new Set(categories.map((c: any) => c.nom))
  );

  const [ouvertes, setOuvertes] = useState<Set<string>>(
    new Set(categories.map((c: any) => c.nom))
  );

  // Modals state
  const [showMiseEnStock, setShowMiseEnStock] = useState(false);
  const [showQuickCatModal, setShowQuickCatModal] = useState(false);
  const [showQuickProdModal, setShowQuickProdModal] = useState(false);
  const [modalEntreeRapide, setModalEntreeRapide] = useState<StockEnriched | null>(null);

  // Stocks physiques enrichis selon l'emplacement (rÃ©actif Ã  toute modification de stocks ou produits)
  const stocksEnriched = useMemo(() => {
    const targetLoc = role === 'boutiquier' ? boutiqueId : filtreEmplacement;
    return getStocksEnriched(targetLoc);
  }, [getStocksEnriched, role, boutiqueId, filtreEmplacement, stocks, produits]);

  // Filtrage selon la catÃ©gorie et la recherche
  const produitsFiltres = useMemo(() => {
    return stocksEnriched.filter((p: any) => {
      // Filtre catÃ©gorie
      if (filtreCat !== 'toutes' && p.categorie !== filtreCat) {
        return false;
      }

      // Recherche texte
      if (search.trim()) {
        const query = search.toLowerCase();
        return (
          p.nom.toLowerCase().includes(query) ||
          p.categorie.toLowerCase().includes(query) ||
          (p.couleur && p.couleur.toLowerCase().includes(query)) ||
          (p.reference && p.reference.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [stocksEnriched, filtreCat, search]);

  const toggleCategory = (catNom: string) => {
    setOuvertes((prev) => {
      const next = new Set(prev);
      if (next.has(catNom)) next.delete(catNom);
      else next.add(catNom);
      return next;
    });
  };

  // CatÃ©gories visibles avec leurs produits associÃ©s
  const categoriesAffichees = useMemo(() => {
    const catMap = new Map();
    categories.forEach((c) => catMap.set(c.nom, c));
    produitsFiltres.forEach((p) => {
      if (!catMap.has(p.categorie)) {
        catMap.set(p.categorie, { nom: p.categorie, couleur: "#64748b" });
      }
    });
    
    return Array.from(catMap.values())
      .filter((cat) => (filtreCat === "toutes" ? true : cat.nom === filtreCat))
      .map((cat) => ({
        categorie: cat,
        produits: produitsFiltres.filter((p) => p.categorie === cat.nom),
      }))
      .filter((group) => group.produits.length > 0 || search === "");
  }, [categories, produitsFiltres, filtreCat, search]);

  const { mutateAsync: executeMovementApi } = useExecuteMovementMutation();
  const { mutateAsync: adjustStockApi } = useAdjustStockMutation();

  return (
    <div className="space-y-4">
      {/* En-tÃªte avec mÃ©triques */}
      <StockHeader role={role as any}
        produits={produitsFiltres}
        
        onOpenMiseEnStock={() => setShowMiseEnStock(true)}
      />

      {/* Barre de filtres et recherche */}
      <StockFilters role={role as any}
        search={search}
        onSearchChange={setSearch}
        boutiques={[]} filtreEmplacement={filtreEmplacement}
        onEmplacementChange={setFiltreEmplacement}
        filtreCat={filtreCat}
        onCatChange={setFiltreCat}
        categories={categories}
        
        
        boutiqueId={boutiqueId}
      />

      {/* Liste des catÃ©gories et articles */}
      <div className="space-y-3">
        {categoriesAffichees.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="text-gray-400 text-sm">
              Aucun produit ne correspond Ã  votre recherche.
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

      {/* Modals modulaires d'approvisionnement et d'ajustement - RÃ©servÃ©es au GÃ©rant */}
      {role === 'gerant' && (
        <>
          <StockInWizardModal role={role as any}
            isOpen={showMiseEnStock}
            onClose={() => setShowMiseEnStock(false)}
            categories={categories}
            boutiques={[]} produitsCatalogue={produits}
            
            
            boutiqueId={boutiqueId}
            
            onOpenNewCat={() => setShowQuickCatModal(true)}
            onOpenNewProd={() => setShowQuickProdModal(true)}
            onSubmit={async ({ produitId, quantite, prix,  unite, pieces, seuil, emplacement }) => {
                await executeMovementApi({
                  produitId,
                  locationId: emplacement,
                  quantite,
                  uniteUtilisee: unite,
                  type: 'ENTREE_STOCK',
                  sens: 'ENTREE',
                  justification: `Arrivage / Réassort (+${quantite} ${unite})`,
                });
                const prodNom = produits.find((p: any) => p.id === produitId)?.nom || 'Produit';
                toast.success(`Mise en stock réussie : +${quantite} ${unite} de ${prodNom}`);
              }}
          />

          <QuickCategoryModal
            isOpen={showQuickCatModal}
            onClose={() => setShowQuickCatModal(false)}
            onSubmit={async (cat: any) => {
                // Not fully implemented on backend, but mocked here
                toast.success(`Catégorie "${cat.nom}" créée avec succès`);
              }}
          />

          <QuickProductModal
            isOpen={showQuickProdModal}
            onClose={() => setShowQuickProdModal(false)}
            categories={categories}
            onSubmit={async (prod) => {
                await addProduit({
                  nom: prod.nom,
                  categorie: prod.categorie,
                  couleur: prod.couleur,
                  photo: prod.photo,
                  reference: prod.nom.substring(0, 3).toUpperCase(),
                  uniteMesure: 'Metre',
                  prixUnitaire: 0
                });
                toast.success(`Tissu "${prod.nom}" ajouté au catalogue`);
              }}
          />

          <QuickStockAdjustmentModal
            produit={modalEntreeRapide}
            
            onClose={() => setModalEntreeRapide(null)}
            onSubmit={async (prodId, qte, motif) => {
                const bId = modalEntreeRapide?.boutiqueId || modalEntreeRapide?.boutique || 'b1';
                await adjustStockApi({
                  produitId: prodId,
                  locationId: bId,
                  quantiteReelle: qte,
                  justification: motif,
                });
                if (qte > 0) {
                  toast.success(`Entrée de stock validée : +${qte} ${modalEntreeRapide?.unite} (${motif})`);
                } else {
                  toast.warning(`Sortie / perte enregistrée : ${qte} ${modalEntreeRapide?.unite} (${motif})`);
                }
              }}
          />
        </>
      )}
    </div>
  );
};

export default Stock;
