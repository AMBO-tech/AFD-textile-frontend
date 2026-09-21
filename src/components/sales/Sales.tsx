import React from 'react';
import { formatMontant } from '../../data/mock';
import SalesHeader from '../../features/ventes/components/SalesHeader';
import { useSalesPOS } from '../../features/ventes/hooks/useSalesPOS';
import SalesCatalog from './SalesCatalog';
import SalesProductConfig from './SalesProductConfig';
import SalesCartDrawer from './SalesCartDrawer';
import SalesSuccessModal from './SalesSuccessModal';
import SalesCancelModal from './SalesCancelModal';
import SalesPaymentModal from './SalesPaymentModal';
import SalesHistoryTable from './SalesHistoryTable';

interface SalesProps {
  role?: 'gerant' | 'boutiquier';
  produitDirectId?: string | null;
  onReset?: () => void;
}

export const Sales: React.FC<SalesProps> = ({
  role = 'boutiquier',
  produitDirectId,
  onReset,
}) => {
  const {
    categories,
    boutiques,
    tab,
    categorieChoisie,
    setCategorieChoisie,
    searchProd,
    setSearchProd,
    produitSelectionne,
    setProduitSelectionne,
    setSelectedBoutiqueId,
    boutiqueActive,
    handleTabChange,
    panier,
    setPanier,
    vuePanier,
    setVuePanier,
    pendingPayment,
    setPendingPayment,
    successData,
    setSuccessData,
    venteToCancel,
    setVenteToCancel,
    stocksBoutique,
    ventesFiltrees,
    totalPanier,
    handleAddToCart,
    handleDirectSale,
    handleCheckoutPanier,
    handleConfirmPayment,
    handleCancelSale,
  } = useSalesPOS({ role, produitDirectId, onReset });

  return (
    <div className="space-y-4">
      {/* En-tête Caisse & Contrôles */}
      <SalesHeader
        role={role}
        boutiques={boutiques}
        boutiqueActive={boutiqueActive}
        onSelectBoutique={(id) => {
          setSelectedBoutiqueId(id);
          setCategorieChoisie(null);
          setSearchProd('');
        }}
        panierLength={panier.length}
        totalPanier={totalPanier}
        formatMontant={formatMontant}
        onOpenPanier={() => setVuePanier(true)}
        tab={tab}
        onTabChange={handleTabChange}
        ventesCount={ventesFiltrees.length}
      />

      {/* Contenu selon onglet */}
      {tab === 'vente' ? (
        <SalesCatalog
          categories={categories}
          produits={stocksBoutique}
          categorieChoisie={categorieChoisie}
          onSelectCategorie={setCategorieChoisie}
          searchProd={searchProd}
          onSearchChange={setSearchProd}
          onSelectProduit={setProduitSelectionne}
          role={role}
        />
      ) : (
        /* Historique des ventes de la boutique active */
        <SalesHistoryTable
          ventes={ventesFiltrees}
          onCancelClick={(v) => setVenteToCancel(v)}
          role={role}
          boutiques={boutiques}
          boutiqueActive={boutiqueActive}
        />
      )}

      {/* Modal Configuration Produit */}
      <SalesProductConfig
        produit={produitSelectionne}
        onClose={() => {
          setProduitSelectionne(null);
          onReset?.();
        }}
        onAddToCart={handleAddToCart}
        onDirectSale={handleDirectSale}
      />

      {/* Tiroir Panier */}
      <SalesCartDrawer
        isOpen={vuePanier}
        onClose={() => setVuePanier(false)}
        panier={panier}
        onUpdateQte={(idx, newQte) =>
          setPanier((prev) =>
            prev.map((item, i) => (i === idx ? { ...item, qte: newQte } : item))
          )
        }
        onRemoveItem={(idx) => setPanier((prev) => prev.filter((_, i) => i !== idx))}
        onCheckout={handleCheckoutPanier}
      />

      {/* Modale dédiée d'encaissement et choix paiement */}
      <SalesPaymentModal
        isOpen={!!pendingPayment}
        onClose={() => setPendingPayment(null)}
        target={pendingPayment}
        onConfirmPayment={handleConfirmPayment}
      />

      {/* Modal Succès Encaissement */}
      {successData && (
        <SalesSuccessModal
          isOpen={!!successData}
          onClose={() => setSuccessData(null)}
          montant={successData.montant}
          paiement={successData.paiement}
          client={successData.client}
        />
      )}

      {/* Modal Annulation de Vente */}
      {venteToCancel && (
        <SalesCancelModal
          vente={venteToCancel}
          onClose={() => setVenteToCancel(null)}
          onConfirmCancel={(id, motif) => handleCancelSale(id, motif)}
        />
      )}
    </div>
  );
};

export default Sales;
