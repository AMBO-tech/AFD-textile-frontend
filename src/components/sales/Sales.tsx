import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Store, ShoppingBag, Clock } from 'lucide-react';
import { useMockStore, type Produit, type StockEnriched, type Vente } from '../../data/useMockStore';
import SalesCatalog from './SalesCatalog';
import SalesProductConfig from './SalesProductConfig';
import SalesCartDrawer from './SalesCartDrawer';
import SalesSuccessModal from './SalesSuccessModal';
import SalesCancelModal from './SalesCancelModal';
import SalesPaymentModal, { type PaymentTarget } from './SalesPaymentModal';
import SalesHistoryTable from './SalesHistoryTable';
import BoutiqueSelector from './BoutiqueSelector';
import type { LigneVente, SalesTab } from './types';
import { formatMontant } from '../../data/mock';
import { toast } from 'sonner';

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

  // L'utilisateur boutiquier est strictement confiné à sa boutique physique
  const isBoutiquier = session?.role === 'boutiquier';
  const boutiqueActive = isBoutiquier ? (session?.boutiqueId || defaultPhysicalBoutique) : selectedBoutiqueId;

  const handleTabChange = (newTab: SalesTab) => {
    setTab(newTab);
    // Lorsqu'on passe sur l'onglet de vente directe, on force impérativement une boutique physique
    if (newTab === 'vente' && selectedBoutiqueId === 'tous') {
      setSelectedBoutiqueId(defaultPhysicalBoutique);
    }
  };

  // Panier
  const [panier, setPanier] = useState<LigneVente[]>([]);
  const [vuePanier, setVuePanier] = useState(false);

  // Modale de paiement dédiée (séparée du formulaire produit et du tiroir panier)
  const [pendingPayment, setPendingPayment] = useState<PaymentTarget | null>(null);

  // Modals confirmation / annulation
  const [successData, setSuccessData] = useState<{ montant: number; paiement: string; client: string } | null>(null);
  const [venteToCancel, setVenteToCancel] = useState<Vente | null>(null);

  // Stocks physiques disponibles dans la boutique active (réactif dès qu'une vente ou ajustement change les stocks)
  const stocksBoutique = useMemo(() => {
    return getStocksEnriched(boutiqueActive);
  }, [getStocksEnriched, boutiqueActive, stocks, produits]);

  // Gestion navigation directe depuis accueil
  useEffect(() => {
    if (produitDirectId) {
      const p = stocksBoutique.find((pr) => pr.id === produitDirectId || pr.produitId === produitDirectId);
      if (p) {
        setProduitSelectionne(p);
      }
    }
  }, [produitDirectId, stocksBoutique]);

  // Ventes filtrées selon le rôle et la boutique active
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

  // Vente directe d'un unique produit -> Déclenche la modale d'encaissement dédiée
  const handleDirectSale = (ligne: LigneVente) => {
    setPendingPayment({ type: 'direct', ligne });
  };

  // Validation du panier -> Déclenche la modale d'encaissement dédiée
  const handleCheckoutPanier = () => {
    if (panier.length === 0) return;
    setPendingPayment({ type: 'cart', panier });
  };

  // Confirmation finale du règlement via la modale dédiée
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

      // Si vente à crédit, inscription automatique dans le dossier de créance du client
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
            id: 'lp_' + Date.now(),
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
          ? `Vente à crédit enregistrée pour ${clientNom} : ${formatMontant(montantLigne)}`
          : `Vente validée : ${formatMontant(montantLigne)} (${modeChoisi})`
      );
      setPendingPayment(null);
      setProduitSelectionne(null);
      onReset?.();
    } else {
      const clientActuel = clientNom;
      const isCredit = modeChoisi === 'Vente à crédit';

      for (const ligne of pendingPayment.panier) {
        const ligneNet =
          ligne.produit.prix * ligne.qte - Math.min(ligne.remise, ligne.produit.prix * ligne.qte);
        const targetBoutique =
          (boutiqueActive === 'tous' ? ligne.produit.boutiqueId : boutiqueActive) || 'b1';

        addVente({
          client: clientActuel,
          produit: ligne.produit.nom,
          produitId: ligne.produit.produitId || ligne.produit.id,
          quantite: ligne.qte,
          unite: ligne.unite,
          montant: ligneNet,
          remise: ligne.remise,
          paiement: modeChoisi,
          date: dateStr,
          heure: heureStr,
          statut: 'validée',
          boutique: targetBoutique,
          vendeur: session?.nom || 'Vendeur',
          typeVente: isCredit ? 'credit' : 'comptant',
        });
      }

      // Si panier validé à crédit, inscription de toutes les lignes dans le dossier de créance
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

  return (
    <div className="space-y-4">
      {/* En-tête Caisse & Contrôles */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs space-y-4">
        {/* Ligne 1 : Titre + Badge statut + Bouton Panier */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-gray-900 text-xl sm:text-2xl">
                Point de Vente
              </h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Caisse active
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Enregistrement des ventes comptant et commandes à crédit
            </p>
          </div>

          {/* Bouton Panier */}
          <button
            type="button"
            onClick={() => setVuePanier(true)}
            className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs text-white shadow-sm hover:opacity-95 transition-all self-start sm:self-auto cursor-pointer"
            style={{ background: '#0F3D5E' }}
          >
            <ShoppingCart size={16} />
            <span>Panier ({panier.length})</span>
            {totalPanier > 0 && (
              <span className="ml-1 pl-2.5 border-l border-white/20 font-extrabold text-amber-300">
                {formatMontant(totalPanier)}
              </span>
            )}
          </button>
        </div>

        {/* Ligne 2 : Sélecteur de Boutique pour Gérant OU Indicateur Boutiquier + Onglets Vente / Historique */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100">
          {/* Sélecteur de point de vente */}
          {role === 'gerant' ? (
            <BoutiqueSelector
              boutiques={boutiques.filter((b) => b.type === 'BOUTIQUE')}
              selectedId={boutiqueActive}
              allowAll={role === 'gerant' && tab === 'historique'}
              onSelect={(id) => {
                setSelectedBoutiqueId(id);
                setCategorieChoisie(null);
                setSearchProd('');
              }}
            />
          ) : (
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200/80">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Store size={16} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Boutique locale
                </span>
                <span className="text-xs font-bold text-gray-800">
                  {boutiques.find((b) => b.id === boutiqueActive)?.nom || 'Boutique locale'}
                </span>
              </div>
            </div>
          )}

          {/* Onglets Vente / Historique */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100/90 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => handleTabChange('vente')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                tab === 'vente'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <ShoppingBag size={14} className={tab === 'vente' ? 'text-blue-600' : 'text-gray-400'} />
              <span>Nouvelle vente</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('historique')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                tab === 'historique'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Clock size={14} className={tab === 'historique' ? 'text-blue-600' : 'text-gray-400'} />
              <span>Historique ({ventesFiltrees.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenu selon onglet */}
      {tab === 'vente' ? (
        <SalesCatalog
          categories={categories}
          produits={stocksBoutique}
          categorieChoisie={categorieChoisie}
          onSelectCategorie={setCategorieChoisie}
          searchProd={searchProd}
          onSearchChange={setSearchProd}
          onSelectProduit={(prod) => setProduitSelectionne(prod)}
          role={role}
        />
      ) : (
        <SalesHistoryTable
          ventes={ventesFiltrees}
          onCancelClick={(v) => setVenteToCancel(v)}
          role={role}
          boutiques={boutiques}
          boutiqueActive={boutiqueActive}
        />
      )}

      {/* Modals modulaires */}
      <SalesProductConfig
        produit={produitSelectionne}
        onClose={() => {
          setProduitSelectionne(null);
          onReset?.();
        }}
        onAddToCart={handleAddToCart}
        onDirectSale={handleDirectSale}
      />

      <SalesCartDrawer
        isOpen={vuePanier}
        onClose={() => setVuePanier(false)}
        panier={panier}
        onUpdateQte={(idx, qte) => {
          setPanier((prev) =>
            prev.map((item, i) => (i === idx ? { ...item, qte } : item))
          );
        }}
        onRemoveItem={(idx) => {
          setPanier((prev) => prev.filter((_, i) => i !== idx));
        }}
        onCheckout={handleCheckoutPanier}
      />

      {/* Modale d'encaissement et de choix du mode de paiement séparée */}
      <SalesPaymentModal
        isOpen={Boolean(pendingPayment)}
        onClose={() => setPendingPayment(null)}
        target={pendingPayment}
        onConfirmPayment={handleConfirmPayment}
      />

      <SalesSuccessModal
        isOpen={Boolean(successData)}
        onClose={() => setSuccessData(null)}
        montant={successData?.montant || 0}
        paiement={successData?.paiement || 'Espèces'}
        client={successData?.client || 'Passage'}
      />

      <SalesCancelModal
        vente={venteToCancel}
        onClose={() => setVenteToCancel(null)}
        onConfirmCancel={(id, motif) => {
          cancelVente(id, motif, session?.nom);
          toast.info(`Vente #${id} annulée (articles réintégrés en stock)`);
        }}
      />
    </div>
  );
};

export default Sales;
