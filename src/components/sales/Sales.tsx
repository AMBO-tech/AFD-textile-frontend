import { formatMontant } from '@/utils/format';
import React from 'react';
import SalesCatalog from './SalesCatalog';
import SalesProductConfig from './SalesProductConfig';
import SalesCartDrawer from './SalesCartDrawer';
import SalesPaymentModal from './SalesPaymentModal';
import SalesSuccessModal from './SalesSuccessModal';
import SalesCancelModal from './SalesCancelModal';
import SalesHistoryTable from './SalesHistoryTable';
import { SalesHeader } from '../../features/ventes/components/SalesHeader';
import { useSalesPOS } from '../../features/ventes/hooks/useSalesPOS';

interface SalesProps {
  produitDirectId?: string | null;
  onReset?: () => void;
}

export const Sales: React.FC<SalesProps> = ({ produitDirectId, onReset }) => {
  const pos = useSalesPOS({ produitDirectId, onReset });

  return (
    <div className="space-y-4">
      <SalesHeader
        role={pos.isBoutiquier ? 'boutiquier' : 'gerant'}
        boutiques={pos.boutiques}
        boutiqueActive={pos.boutiqueActive ?? ''}
        onSelectBoutique={pos.changerBoutique}
        panierLength={pos.panier.length}
        totalPanier={pos.totalPanier}
        formatMontant={formatMontant}
        onOpenPanier={() => pos.setVuePanier(true)}
        tab={pos.tab}
        onTabChange={pos.setTab}
        ventesCount={pos.ventes.length}
      />

      {!pos.boutiqueActive ? (
        <div className="text-center py-10 text-sm text-gray-500 bg-white rounded-2xl border border-gray-100">
          Aucune boutique n'est associée à ce compte : la caisse est indisponible.
        </div>
      ) : pos.tab === 'vente' ? (
        <SalesCatalog
          categories={pos.categories}
          produits={pos.produits}
          isLoading={pos.isLoadingStock}
          categorieChoisie={pos.categorieChoisie}
          onSelectCategorie={pos.setCategorieChoisie}
          searchProd={pos.searchProd}
          onSearchChange={pos.setSearchProd}
          onSelectProduit={pos.setProduitSelectionne}
        />
      ) : (
        <SalesHistoryTable ventes={pos.ventes} onCancelClick={pos.setVenteToCancel} />
      )}

      <SalesProductConfig
        key={pos.produitSelectionne?.id ?? 'aucun'}
        produit={pos.produitSelectionne}
        onClose={() => {
          pos.setProduitSelectionne(null);
          onReset?.();
        }}
        onAddToCart={pos.handleAddToCart}
        onDirectSale={pos.handleDirectSale}
      />

      <SalesCartDrawer
        isOpen={pos.vuePanier}
        onClose={() => pos.setVuePanier(false)}
        panier={pos.panier}
        onUpdateQte={(idx, qte) =>
          pos.setPanier((prev) => prev.map((item, i) => (i === idx ? { ...item, qte } : item)))
        }
        onRemoveItem={(idx) => pos.setPanier((prev) => prev.filter((_, i) => i !== idx))}
        onCheckout={pos.handleCheckoutPanier}
      />

      <SalesPaymentModal
        isOpen={Boolean(pos.pendingPayment)}
        onClose={() => pos.setPendingPayment(null)}
        target={pos.pendingPayment}
        onConfirmPayment={pos.handleConfirmPayment}
      />

      <SalesSuccessModal
        isOpen={Boolean(pos.successData)}
        onClose={() => pos.setSuccessData(null)}
        montant={pos.successData?.montant ?? 0}
        paiement={pos.successData?.paiement ?? ''}
        client={pos.successData?.client ?? ''}
        reference={pos.successData?.reference}
      />

      <SalesCancelModal
        vente={pos.venteToCancel}
        onClose={() => pos.setVenteToCancel(null)}
        onConfirmCancel={pos.handleCancelSale}
      />
    </div>
  );
};

export default Sales;
