import { useState, useMemo, useEffect } from 'react';
import { useMockStore, type StockEnriched, type Vente } from '../../../data/useMockStore';
import { formatMontant } from '../../../data/mock';
import { toast } from 'sonner';
import type { SalesTab } from '../types';
import type { LigneVente } from '../../pos/types';
import type { PaymentTarget } from '../../../components/sales/SalesPaymentModal';

interface UseSalesPOSProps {
  role?: 'gerant' | 'boutiquier';
  produitDirectId?: string | null;
  onReset?: () => void;
}

export const useSalesPOS = ({ role = 'boutiquier', produitDirectId, onReset }: UseSalesPOSProps) => {
  const {
    produits,
    stocks,
    clients,
    categories,
    boutiques,
    ventes,
    addVente,
    addCreance,
    addClient,
    cancelVente,
    session,
    getStocksEnriched,
  } = useMockStore();

  const [tab, setTab] = useState<SalesTab>('vente');
  const [categorieChoisie, setCategorieChoisie] = useState<string | null>(null);
  const [searchProd, setSearchProd] = useState('');
  const [produitSelectionne, setProduitSelectionne] = useState<StockEnriched | null>(null);

  // Boutique active (configurable pour le gérant, fixée pour le boutiquier)
  const defaultPhysicalBoutique = session?.boutiqueId || boutiques.find((b) => b.type === 'BOUTIQUE')?.id || 'b1';
  const [selectedBoutiqueId, setSelectedBoutiqueId] = useState<string>(defaultPhysicalBoutique);

  const isBoutiquier = session?.role === 'boutiquier';
  const boutiqueActive = isBoutiquier ? (session?.boutiqueId || defaultPhysicalBoutique) : selectedBoutiqueId;

  const handleTabChange = (newTab: SalesTab) => {
    setTab(newTab);
    if (newTab === 'vente' && selectedBoutiqueId === 'tous') {
      setSelectedBoutiqueId(defaultPhysicalBoutique);
    }
  };

  // Panier
  const [panier, setPanier] = useState<LigneVente[]>([]);
  const [vuePanier, setVuePanier] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<PaymentTarget | null>(null);
  const [successData, setSuccessData] = useState<{ montant: number; paiement: string; client: string } | null>(null);
  const [venteToCancel, setVenteToCancel] = useState<Vente | null>(null);

  const stocksBoutique = useMemo(() => {
    return getStocksEnriched(boutiqueActive);
  }, [getStocksEnriched, boutiqueActive, stocks, produits]);

  useEffect(() => {
    if (produitDirectId) {
      const p = stocksBoutique.find((pr) => pr.id === produitDirectId || pr.produitId === produitDirectId);
      if (p) {
        setProduitSelectionne(p);
      }
    }
  }, [produitDirectId, stocksBoutique]);

  const ventesFiltrees = useMemo(() => {
    if (role === 'boutiquier') {
      return ventes.filter((v) => v.boutique === boutiqueActive);
    }
    if (boutiqueActive === 'tous') {
      return ventes;
    }
    return ventes.filter((v) => v.boutique === boutiqueActive);
  }, [ventes, role, boutiqueActive]);

  const totalPanier = panier.reduce(
    (s, l) => s + l.produit.prix * l.qte - Math.min(l.remise, l.produit.prix * l.qte),
    0
  );

  const handleAddToCart = (ligne: LigneVente) => {
    setPanier((prev) => [...prev, ligne]);
    toast.success(`${ligne.produit.nom} (${ligne.qte} ${ligne.unite}) ajouté au panier`);
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

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const heureStr = now.toTimeString().slice(0, 5);

    if (pendingPayment.type === 'direct') {
      const ligne = pendingPayment.ligne;
      const montantLigne =
        ligne.produit.prix * ligne.qte - Math.min(ligne.remise, ligne.produit.prix * ligne.qte);
      const targetBoutique =
        (boutiqueActive === 'tous' ? ligne.produit.boutiqueId : boutiqueActive) || 'b1';

      addVente({
        client: clientNom,
        produit: ligne.produit.nom,
        produitId: ligne.produit.produitId || ligne.produit.id,
        quantite: ligne.qte,
        unite: ligne.unite,
        montant: montantLigne,
        remise: ligne.remise,
        paiement: modeChoisi,
        date: dateStr,
        heure: heureStr,
        statut: 'validée',
        boutique: targetBoutique,
        vendeur: session?.nom || 'Vendeur',
        typeVente: modeChoisi === 'Vente à crédit' ? 'credit' : 'comptant',
      });

      if (modeChoisi === 'Vente à crédit') {
        let clientObj = clients.find((c) => c.nom.toLowerCase() === clientNom.toLowerCase());
        if (!clientObj) {
          clientObj = addClient({
            nom: clientNom,
            telephone: '',
            adresse: 'Dakar',
            boutiqueId: targetBoutique,
          });
        }
        addCreance(clientObj.id, [
          {
            id: `lp_${Date.now()}`,
            produitId: ligne.produit.produitId || ligne.produit.id,
            nom: ligne.produit.nom,
            quantite: ligne.qte,
            unite: ligne.unite,
            prixUnitaire: ligne.produit.prix,
            totalLigne: montantLigne,
          },
        ]);
      }

      setSuccessData({
        montant: montantLigne,
        paiement: modeChoisi,
        client: clientNom,
      });

      toast.success(
        modeChoisi === 'Vente à crédit'
          ? `Vente à crédit enregistrée pour ${clientNom} (${formatMontant(montantLigne)})`
          : `Vente validée : ${formatMontant(montantLigne)} encaissés (${modeChoisi})`
      );
      setProduitSelectionne(null);
      setPendingPayment(null);
      onReset?.();
    } else {
      const isCredit = modeChoisi === 'Vente à crédit';
      const clientActuel = clientNom.trim() || 'Client de passage';
      const targetBoutique = (boutiqueActive === 'tous' ? 'b1' : boutiqueActive) || 'b1';

      pendingPayment.panier.forEach((ligne) => {
        const montantLigne =
          ligne.produit.prix * ligne.qte - Math.min(ligne.remise, ligne.produit.prix * ligne.qte);
        addVente({
          client: clientActuel,
          produit: ligne.produit.nom,
          produitId: ligne.produit.produitId || ligne.produit.id,
          quantite: ligne.qte,
          unite: ligne.unite,
          montant: montantLigne,
          remise: ligne.remise,
          paiement: modeChoisi,
          date: dateStr,
          heure: heureStr,
          statut: 'validée',
          boutique: targetBoutique,
          vendeur: session?.nom || 'Vendeur',
          typeVente: isCredit ? 'credit' : 'comptant',
        });
      });

      if (isCredit) {
        let clientObj = clients.find((c) => c.nom.toLowerCase() === clientActuel.toLowerCase());
        if (!clientObj) {
          clientObj = addClient({
            nom: clientActuel,
            telephone: '',
            adresse: 'Dakar',
            boutiqueId: boutiqueActive || 'b1',
          });
        }
        const lignesCreance = pendingPayment.panier.map((l, idx) => ({
          id: `lp_${Date.now()}_${idx}`,
          produitId: l.produit.produitId || l.produit.id,
          nom: l.produit.nom,
          quantite: l.qte,
          unite: l.unite,
          prixUnitaire: l.produit.prix,
          totalLigne: l.produit.prix * l.qte - Math.min(l.remise, l.produit.prix * l.qte),
        }));
        addCreance(clientObj.id, lignesCreance);
      }

      setSuccessData({
        montant: totalPanier,
        paiement: modeChoisi,
        client: clientActuel,
      });

      toast.success(
        isCredit
          ? `Vente à crédit groupée enregistrée pour ${clientActuel} (${panier.length} articles, ${formatMontant(totalPanier)})`
          : `Panier encaissé avec succès : ${panier.length} article(s) pour ${formatMontant(totalPanier)} (${modeChoisi})`
      );
      setPanier([]);
      setVuePanier(false);
      setPendingPayment(null);
    }
  };

  const handleCancelSale = (venteId: string, motif: string) => {
    cancelVente(venteId, motif);
    toast.error(`Vente annulée avec succès. Motif: ${motif}`);
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
