import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import type { SalesTab } from '../types';
import type { LigneVente } from '../../pos/types';
import type { PaymentTarget } from '../../../components/sales/SalesPaymentModal';
import { useCreateSaleMutation, useCancelSaleMutation, useSalesListQuery } from '../../../hooks/queries/useSalesQuery';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useStockLevelsQuery } from '../../../hooks/queries/useStocksQuery';
import { useLocationsListQuery } from '../../../hooks/queries/useLocationsQuery';
import { useProductsQuery } from '../../../hooks/queries/useProductsQuery';
import { useClientsListQuery, useCreateClientMutation } from '../../../hooks/queries/useClientsQuery';
import type { StockLevel } from '../../../types/stocks';

const formatMontant = (n: number) => new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n);

interface UseSalesPOSProps {
  role?: 'gerant' | 'boutiquier';
  produitDirectId?: string | null;
  onReset?: () => void;
}

export const useSalesPOS = ({ role = 'boutiquier', produitDirectId, onReset }: UseSalesPOSProps) => {
  const { user } = useAuthStore();
  const isBoutiquier = user?.role === 'BOUTIQUIER';

  const { data: locData } = useLocationsListQuery();
  const boutiques = locData?.data ?? [];
  const defaultPhysicalBoutique = user?.locationId || boutiques.find((b) => b.type === 'BOUTIQUE')?.id || 'b1';
  
  const { data: prodData } = useProductsQuery();
  const categories = (prodData as any)?.categories ?? [];

  const { data: clientsData } = useClientsListQuery();
  const clients = clientsData?.data ?? [];

  const { mutate: createClientApi } = useCreateClientMutation();
  const { mutate: createSaleApi } = useCreateSaleMutation();
  const { mutate: cancelSaleApi } = useCancelSaleMutation();

  const [tab, setTab] = useState<SalesTab>('vente');
  const [categorieChoisie, setCategorieChoisie] = useState<string | null>(null);
  const [searchProd, setSearchProd] = useState('');
  const [produitSelectionne, setProduitSelectionne] = useState<StockLevel | null>(null);

  const [selectedBoutiqueId, setSelectedBoutiqueId] = useState<string>(defaultPhysicalBoutique);
  const boutiqueActive = isBoutiquier ? (user?.locationId || defaultPhysicalBoutique) : selectedBoutiqueId;

  const { data: stockData } = useStockLevelsQuery({ locationId: boutiqueActive !== 'tous' ? boutiqueActive : undefined, limit: 1000 });
  const stocksBoutique = stockData?.data ?? [];

  const { data: ventesData } = useSalesListQuery({ boutiqueId: boutiqueActive !== 'tous' ? boutiqueActive : undefined, limit: 1000 });
  const ventesFiltrees = ventesData?.data ?? [];

  const handleTabChange = (newTab: SalesTab) => {
    setTab(newTab);
    if (newTab === 'vente' && selectedBoutiqueId === 'tous') {
      setSelectedBoutiqueId(defaultPhysicalBoutique);
    }
  };

  const [panier, setPanier] = useState<LigneVente[]>([]);
  const [vuePanier, setVuePanier] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<PaymentTarget | null>(null);
  const [successData, setSuccessData] = useState<{ montant: number; paiement: string; client: string } | null>(null);
  const [venteToCancel, setVenteToCancel] = useState<any | null>(null);

  useEffect(() => {
    if (produitDirectId && stocksBoutique.length > 0) {
      const p = stocksBoutique.find((pr) => pr.id === produitDirectId || pr.produitId === produitDirectId);
      if (p) {
        setProduitSelectionne(p);
      }
    }
  }, [produitDirectId, stocksBoutique]);

  // Hack for missing prix on StockLevel - assume 5000 as default or map it properly in the future
  const getProductPrice = (productId: string) => 5000; 

  const totalPanier = panier.reduce(
    (s, l) => s + getProductPrice(l.produit.produitId) * l.qte - Math.min(l.remise, getProductPrice(l.produit.produitId) * l.qte),
    0
  );

  const handleAddToCart = (ligne: LigneVente) => {
    setPanier((prev) => [...prev, ligne]);
    toast.success(`${ligne.produit.produitNom} (${ligne.qte} ${ligne.unite}) ajoutÃ© au panier`);
    onReset?.();
  };

  const handleDirectSale = (ligne: LigneVente) => {
    setPendingPayment({ type: 'direct', ligne });
  };

  const handleCheckoutPanier = () => {
    if (panier.length === 0) return;
    setPendingPayment({ type: 'cart', panier });
  };

  const handleConfirmPayment = (clientNom: string, modeChoisi: string) => {
    if (!pendingPayment) return;

    if (pendingPayment.type === 'direct') {
      const ligne = pendingPayment.ligne;
      const price = getProductPrice(ligne.produit.produitId);
      const montantLigne = price * ligne.qte - Math.min(ligne.remise, price * ligne.qte);
      const targetBoutique = (boutiqueActive === 'tous' ? ligne.produit.locationId : boutiqueActive) || 'b1';

      createSaleApi({
        boutiqueId: targetBoutique,
        lignes: [
          {
            produitId: ligne.produit.produitId || ligne.produit.id,
            quantite: ligne.qte,
            uniteSaisie: ligne.unite,
            prixUnitaireApplique: price,
            remiseMontant: ligne.remise,
          },
        ],
        paiementInitial: modeChoisi !== 'Vente Ã  crÃ©dit' ? {
          montant: montantLigne,
          modePaiement: modeChoisi === 'Wave' ? 'WAVE' : modeChoisi === 'Orange Money' ? 'ORANGE_MONEY' : 'ESPECES',
        } : undefined,
      });

      setSuccessData({ montant: montantLigne, paiement: modeChoisi, client: clientNom });
      toast.success(modeChoisi === 'Vente Ã  crÃ©dit' ? `Vente Ã  crÃ©dit enregistrÃ©e pour ${clientNom} (${formatMontant(montantLigne)})` : `Vente validÃ©e : ${formatMontant(montantLigne)} encaissÃ©s (${modeChoisi})`);
      setProduitSelectionne(null);
      setPendingPayment(null);
      onReset?.();
    } else {
      const isCredit = modeChoisi === 'Vente Ã  crÃ©dit';
      const clientActuel = clientNom.trim() || 'Client de passage';
      const targetBoutique = (boutiqueActive === 'tous' ? 'b1' : boutiqueActive) || 'b1';

      createSaleApi({
        boutiqueId: targetBoutique,
        lignes: pendingPayment.panier.map((l) => ({
          produitId: l.produit.produitId || l.produit.id,
          quantite: l.qte,
          uniteSaisie: l.unite,
          prixUnitaireApplique: getProductPrice(l.produit.produitId),
          remiseMontant: l.remise,
        })),
        paiementInitial: !isCredit ? {
          montant: totalPanier,
          modePaiement: modeChoisi === 'Wave' ? 'WAVE' : modeChoisi === 'Orange Money' ? 'ORANGE_MONEY' : 'ESPECES',
        } : undefined,
      });

      setSuccessData({ montant: totalPanier, paiement: modeChoisi, client: clientActuel });
      toast.success(isCredit ? `Vente Ã  crÃ©dit groupÃ©e enregistrÃ©e pour ${clientActuel} (${panier.length} articles, ${formatMontant(totalPanier)})` : `Panier encaissÃ© avec succÃ¨s : ${panier.length} article(s) pour ${formatMontant(totalPanier)} (${modeChoisi})`);
      setPanier([]);
      setVuePanier(false);
      setPendingPayment(null);
    }
  };

  const handleCancelSale = (venteId: string, motif: string) => {
    cancelSaleApi({ id: venteId, motif });
    toast.error(`Vente annulÃ©e avec succÃ¨s. Motif: ${motif}`);
    setVenteToCancel(null);
  };

  return {
    categories,
    boutiques,
    tab,
    categorieChoisie,
    setCategorieChoisie,
    searchProd,
    setSearchProd,
    produitSelectionne,
    setProduitSelectionne,
    selectedBoutiqueId,
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
  };
};

export default useSalesPOS;
