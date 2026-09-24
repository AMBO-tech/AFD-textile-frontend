import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import type { SalesTab } from '../types';
import { MODES_PAIEMENT } from '../../pos/types';
import type { LigneVente, PaymentChoice, PosProduit } from '../../pos/types';
import { montantsLigne, toPosProduit, totalPanier as calculerTotalPanier } from '../../pos/pricing';
import type { PaymentTarget } from '../../../components/sales/SalesPaymentModal';
import { useCreateSaleMutation, useCancelSaleMutation, useSalesListQuery } from '../../../hooks/queries/useSalesQuery';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useStockLevelsQuery } from '../../../hooks/queries/useStocksQuery';
import { useLocationsListQuery } from '../../../hooks/queries/useLocationsQuery';
import { useCategoriesQuery } from '../../../hooks/queries/useProductsQuery';
import { getErrorMessage } from '../../../services/api';
import type { CreateSaleDto, Vente } from '../../../types/sales';
import { formatMontant } from '../../../utils/format';

/** Plafond imposé par l'API sur les listes paginées. */
const API_PAGE_MAX = 100;

interface UseSalesPOSProps {
  produitDirectId?: string | null;
  onReset?: () => void;
}

export interface SaleSuccess {
  montant: number;
  paiement: string;
  client: string;
  reference: string;
}

const lignesPourApi = (lignes: LigneVente[]): CreateSaleDto['lignes'] =>
  lignes.map((l) => ({
    produitId: l.produit.produitId,
    quantite: l.qte,
    uniteSaisie: l.unite,
    remiseMontant: montantsLigne(l).remise,
  }));

export const useSalesPOS = ({ produitDirectId, onReset }: UseSalesPOSProps) => {
  const { user } = useAuthStore();
  const isBoutiquier = user?.role === 'BOUTIQUIER';

  const { data: locData } = useLocationsListQuery();
  const boutiques = useMemo(
    () => (locData?.data ?? []).filter((b) => b.type === 'BOUTIQUE'),
    [locData],
  );

  const { data: categoriesData } = useCategoriesQuery();
  const categories: { id: string; nom: string }[] = categoriesData ?? [];

  const { mutateAsync: createSaleApi } = useCreateSaleMutation();
  const { mutateAsync: cancelSaleApi } = useCancelSaleMutation();

  const [tab, setTab] = useState<SalesTab>('vente');
  const [categorieChoisie, setCategorieChoisie] = useState<string | null>(null);
  const [searchProd, setSearchProd] = useState('');
  const [produitSelectionne, setProduitSelectionne] = useState<PosProduit | null>(null);

  // Le boutiquier vend dans sa boutique ; le gérant choisit (première boutique par défaut).
  const [selectedBoutiqueId, setSelectedBoutiqueId] = useState<string | null>(null);
  const boutiqueActive: string | null = isBoutiquier
    ? (user?.locationId ?? null)
    : (selectedBoutiqueId ?? boutiques[0]?.id ?? null);

  const { data: stockData, isLoading: isLoadingStock } = useStockLevelsQuery(
    boutiqueActive ? { locationId: boutiqueActive, limit: API_PAGE_MAX } : undefined,
    { enabled: Boolean(boutiqueActive) },
  );
  const produits = useMemo(() => (stockData?.data ?? []).map(toPosProduit), [stockData]);

  const { data: ventesData } = useSalesListQuery({
    ...(boutiqueActive ? { boutiqueId: boutiqueActive } : {}),
    limit: API_PAGE_MAX,
  });
  const ventes: Vente[] = ventesData?.data ?? [];

  const [panier, setPanier] = useState<LigneVente[]>([]);
  const [vuePanier, setVuePanier] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<PaymentTarget | null>(null);
  const [successData, setSuccessData] = useState<SaleSuccess | null>(null);
  const [venteToCancel, setVenteToCancel] = useState<Vente | null>(null);

  useEffect(() => {
    if (!produitDirectId) return;
    const p = produits.find((pr) => pr.id === produitDirectId || pr.produitId === produitDirectId);
    if (p) setProduitSelectionne(p);
  }, [produitDirectId, produits]);

  // Changer de boutique vide le panier : ses prix et stocks ne valent que pour la boutique d'origine.
  const changerBoutique = (id: string) => {
    if (id === boutiqueActive) return;
    if (panier.length > 0) {
      toast.info('Panier vidé : les prix et les stocks dépendent de la boutique.');
      setPanier([]);
    }
    setSelectedBoutiqueId(id);
  };

  const totalPanier = calculerTotalPanier(panier);

  const handleAddToCart = (ligne: LigneVente) => {
    setPanier((prev) => [...prev, ligne]);
    toast.success(`${ligne.produit.nom} ajouté au panier`);
    onReset?.();
  };

  const handleDirectSale = (ligne: LigneVente) => {
    setPendingPayment({ type: 'direct', ligne });
  };

  const handleCheckoutPanier = () => {
    if (panier.length === 0) return;
    setPendingPayment({ type: 'cart', panier });
  };

  /**
   * Enregistre la vente et n'affiche le succès qu'après la réponse de l'API.
   * En cas d'échec, l'erreur est relancée pour que la fenêtre d'encaissement reste ouverte.
   */
  const handleConfirmPayment = async ({ mode, clientId, clientNom }: PaymentChoice) => {
    if (!pendingPayment) return;
    if (!boutiqueActive) {
      throw new Error("Sélectionnez une boutique avant d'encaisser.");
    }

    const lignes = pendingPayment.type === 'direct' ? [pendingPayment.ligne] : pendingPayment.panier;
    // Caisse = vente comptant : le total est encaissé immédiatement.
    const moyen = MODES_PAIEMENT.find((m) => m.label === mode)?.api;
    if (!moyen) {
      throw new Error('Mode de paiement inconnu.');
    }

    let vente: Vente;
    try {
      vente = await createSaleApi({
        boutiqueId: boutiqueActive,
        ...(clientId ? { clientId } : {}),
        lignes: lignesPourApi(lignes),
        paiementInitial: { montant: calculerTotalPanier(lignes), modePaiement: moyen },
        idempotencyKey: crypto.randomUUID(),
      });
    } catch (error) {
      const message = getErrorMessage(error, "La vente n'a pas pu être enregistrée.");
      toast.error(message);
      throw new Error(message);
    }

    const client = clientNom || 'Client de passage';
    setSuccessData({
      montant: vente.montantTotal,
      paiement: mode,
      client,
      reference: vente.referenceFacture,
    });
    toast.success(`Vente ${vente.referenceFacture} encaissée : ${formatMontant(vente.montantTotal)} (${mode})`);

    setPendingPayment(null);
    setProduitSelectionne(null);
    if (pendingPayment.type === 'cart') {
      setPanier([]);
      setVuePanier(false);
    }
    onReset?.();
  };

  const handleCancelSale = async (venteId: string, motif: string) => {
    try {
      await cancelSaleApi({ id: venteId, motif });
      toast.success('Vente annulée : le stock a été réintégré.');
      setVenteToCancel(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "L'annulation a échoué."));
    }
  };

  return {
    categories,
    boutiques,
    isBoutiquier,
    tab,
    setTab,
    categorieChoisie,
    setCategorieChoisie,
    searchProd,
    setSearchProd,
    produitSelectionne,
    setProduitSelectionne,
    boutiqueActive,
    changerBoutique,
    produits,
    isLoadingStock,
    ventes,
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
    totalPanier,
    handleAddToCart,
    handleDirectSale,
    handleCheckoutPanier,
    handleConfirmPayment,
    handleCancelSale,
  };
};

export default useSalesPOS;
