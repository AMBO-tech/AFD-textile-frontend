import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useMockStore, type Produit, type StockEnriched } from '../../data/useMockStore';
import StockHeader from './StockHeader';
import StockFilters from './StockFilters';
import StockCategoryGroup from './StockCategoryGroup';
import QuickCategoryModal from './QuickCategoryModal';
import QuickProductModal from './QuickProductModal';
import QuickStockAdjustmentModal from './QuickStockAdjustmentModal';
import StockInWizardModal from './StockInWizardModal';
import {
  useAdjustStockMutation,
  useExecuteMovementMutation,
} from '../../hooks/queries/useStocksQuery';

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
    stocks,
    categories,
    boutiques,
    adjustStock,
    upsertStockItem,
    addProduit,
    addCategorie,
    getStocksEnriched,
  } = useMockStore();

  const [search, setSearch] = useState('');
  const [filtreEmplacement, setFiltreEmplacement] = useState<string>(
    role === 'boutiquier' ? boutiqueId : 'tous'
  );
  const [filtreCat, setFiltreCat] = useState('toutes');

  // Catégories existantes + celles dérivées des produits
  const allCategories = Array.from(
    new Set(categories.map((c) => c.nom))
  );

  const [ouvertes, setOuvertes] = useState<Set<string>>(
    new Set(categories.map((c) => c.nom))
  );

  // Modals state
  const [showMiseEnStock, setShowMiseEnStock] = useState(false);
  const [showQuickCatModal, setShowQuickCatModal] = useState(false);
  const [showQuickProdModal, setShowQuickProdModal] = useState(false);
  const [modalEntreeRapide, setModalEntreeRapide] = useState<StockEnriched | null>(null);

  // Stocks physiques enrichis selon l'emplacement (réactif à toute modification de stocks ou produits)
  const stocksEnriched = useMemo(() => {
    const targetLoc = role === 'boutiquier' ? boutiqueId : filtreEmplacement;
    return getStocksEnriched(targetLoc);
  }, [getStocksEnriched, role, boutiqueId, filtreEmplacement, stocks, produits]);

  // Filtrage selon la catégorie et la recherche
  const produitsFiltres = useMemo(() => {
    return stocksEnriched.filter((p) => {
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

  const { mutate: executeMovementApi } = useExecuteMovementMutation();
  const { mutate: adjustStockApi } = useAdjustStockMutation();

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
              boutiques={boutiques}
              afficherEmplacement={role === 'gerant' || filtreEmplacement === 'tous'}
              role={role}
            />
          ))
        )}
      </div>

      {/* Modals modulaires d'approvisionnement et d'ajustement - Réservées au Gérant */}
      {role === 'gerant' && (
        <>
          <StockInWizardModal
            isOpen={showMiseEnStock}
            onClose={() => setShowMiseEnStock(false)}
            categories={categories}
            produitsCatalogue={produits}
            boutiques={boutiques}
            role={role}
            boutiqueId={boutiqueId}
            emplacementInitial={filtreEmplacement !== 'tous' ? filtreEmplacement : 'entrepot'}
            onOpenNewCat={() => setShowQuickCatModal(true)}
            onOpenNewProd={() => setShowQuickProdModal(true)}
            onSubmit={({ produitId, quantite, prix, prixMinimal, unite, pieces, seuil, emplacement }) => {
              upsertStockItem({
                produitId,
                boutiqueId: emplacement,
                quantite,
                prixVente: prix,
                prixMinimal,
                unite,
                pieces,
                seuil,
              });

              // Synchronisation API réelle
              executeMovementApi({
                produitId,
                locationId: emplacement,
                quantite,
                type: 'ENTREE_STOCK',
                uniteUtilisee: unite,
                sens: 'ENTREE',
                justification: `Arrivage / Réassort (+${quantite} ${unite})`,
              });
              const prodNom = produits.find((p) => p.id === produitId)?.nom || 'Produit';
              const nomCible = emplacement === 'entrepot'
                ? 'Entrepôt Central'
                : (boutiques.find((b) => b.id === emplacement)?.nom || emplacement);
              toast.success(`Mise en stock réussie à ${nomCible} : +${quantite} ${unite} de ${prodNom}`);
            }}
          />

          <QuickCategoryModal
            isOpen={showQuickCatModal}
            onClose={() => setShowQuickCatModal(false)}
            onSubmit={(cat) => {
              addCategorie(cat);
              toast.success(`Catégorie "${cat.nom}" créée avec succès`);
            }}
          />

          <QuickProductModal
            isOpen={showQuickProdModal}
            onClose={() => setShowQuickProdModal(false)}
            categories={categories}
            onSubmit={(prod) => {
              addProduit({
                nom: prod.nom,
                categorie: prod.categorie,
                couleur: prod.couleur,
                photo: prod.photo,
              });
              toast.success(`Tissu "${prod.nom}" ajouté au catalogue`);
            }}
          />

          <QuickStockAdjustmentModal
            produit={modalEntreeRapide}
            boutiques={boutiques}
            onClose={() => setModalEntreeRapide(null)}
            onSubmit={(prodId, qte, motif) => {
              adjustStock(prodId, qte, motif, undefined, modalEntreeRapide?.boutiqueId);

              // Synchronisation API réelle
              const bId = modalEntreeRapide?.boutiqueId || modalEntreeRapide?.boutique || 'b1';
              adjustStockApi({
                produitId: prodId,
                locationId: bId,
                quantiteReelle: qte,
                justification: motif,
              });
              const nomCible = bId === 'entrepot' || bId === 'b-ent'
                ? 'Entrepôt Central'
                : (boutiques.find((b) => b.id === bId)?.nom || 'la boutique');
              if (qte > 0) {
                toast.success(`Entrée de stock validée à ${nomCible} : +${qte} ${modalEntreeRapide?.unite} (${motif})`);
              } else {
                toast.warning(`Sortie / perte enregistrée à ${nomCible} : ${qte} ${modalEntreeRapide?.unite} (${motif})`);
              }
            }}
          />
        </>
      )}
    </div>
  );
};

export default Stock;
