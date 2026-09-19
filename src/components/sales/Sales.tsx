import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, RotateCcw } from 'lucide-react';
import { useMockStore, type Produit, type Vente } from '../../data/useMockStore';
import SalesCatalog from './SalesCatalog';
import SalesProductConfig from './SalesProductConfig';
import SalesCartDrawer from './SalesCartDrawer';
import SalesSuccessModal from './SalesSuccessModal';
import SalesCancelModal from './SalesCancelModal';
import SalesHistoryTable from './SalesHistoryTable';
import type { LigneVente, SalesTab } from './types';
import { formatMontant } from '../../data/mock';

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
    categories,
    ventes,
    addVente,
    cancelVente,
    session,
  } = useMockStore();

  const [tab, setTab] = useState<SalesTab>('vente');
  const [categorieChoisie, setCategorieChoisie] = useState<string | null>(null);
  const [searchProd, setSearchProd] = useState('');
  const [produitSelectionne, setProduitSelectionne] = useState<Produit | null>(null);

  // Panier
  const [panier, setPanier] = useState<LigneVente[]>([]);
  const [vuePanier, setVuePanier] = useState(false);
  const [modePaiement, setModePaiement] = useState('Espèces');
  const [nomClient, setNomClient] = useState('');

  // Modals confirmation / annulation
  const [successData, setSuccessData] = useState<{ montant: number; paiement: string; client: string } | null>(null);
  const [venteToCancel, setVenteToCancel] = useState<Vente | null>(null);

  // Gestion navigation directe depuis accueil
  useEffect(() => {
    if (produitDirectId) {
      const p = produits.find((pr) => pr.id === produitDirectId);
      if (p) {
        setProduitSelectionne(p);
      }
    }
  }, [produitDirectId, produits]);

  // Ventes filtrées selon le rôle
  const boutiqueId = session?.boutiqueId || 'b1';
  const ventesFiltrees = useMemo(() => {
    return role === 'gerant' ? ventes : ventes.filter((v) => v.boutique === boutiqueId);
  }, [ventes, role, boutiqueId]);

  const totalPanier = panier.reduce(
    (s, l) => s + l.produit.prix * l.qte - Math.min(l.remise, l.produit.prix * l.qte),
    0
  );

  const handleAddToCart = (ligne: LigneVente) => {
    setPanier((prev) => [...prev, ligne]);
    onReset?.();
  };

  const handleDirectSale = (ligne: LigneVente) => {
    const montantLigne = ligne.produit.prix * ligne.qte - Math.min(ligne.remise, ligne.produit.prix * ligne.qte);
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const heureStr = now.toTimeString().slice(0, 5);

    addVente({
      client: nomClient.trim() || 'Passage',
      produit: ligne.produit.nom,
      produitId: ligne.produit.id,
      quantite: ligne.qte,
      unite: ligne.unite,
      montant: montantLigne,
      remise: ligne.remise,
      paiement: modePaiement,
      date: dateStr,
      heure: heureStr,
      statut: 'validée',
      boutique: boutiqueId,
      vendeur: session?.nom || 'Vendeur',
      typeVente: 'comptant',
    });

    setSuccessData({
      montant: montantLigne,
      paiement: modePaiement,
      client: nomClient.trim() || 'Passage',
    });

    onReset?.();
  };

  const handleCheckoutPanier = () => {
    if (panier.length === 0) return;

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const heureStr = now.toTimeString().slice(0, 5);
    const clientActuel = nomClient.trim() || 'Passage';

    for (const ligne of panier) {
      const ligneNet = ligne.produit.prix * ligne.qte - Math.min(ligne.remise, ligne.produit.prix * ligne.qte);
      addVente({
        client: clientActuel,
        produit: ligne.produit.nom,
        produitId: ligne.produit.id,
        quantite: ligne.qte,
        unite: ligne.unite,
        montant: ligneNet,
        remise: ligne.remise,
        paiement: modePaiement,
        date: dateStr,
        heure: heureStr,
        statut: 'validée',
        boutique: boutiqueId,
        vendeur: session?.nom || 'Vendeur',
        typeVente: 'comptant',
      });
    }

    setSuccessData({
      montant: totalPanier,
      paiement: modePaiement,
      client: clientActuel,
    });

    setPanier([]);
    setVuePanier(false);
  };

  return (
    <div className="space-y-4">
      {/* En-tête Caisse & Onglets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div>
          <h1 className="font-display font-bold text-gray-900 text-xl sm:text-2xl">
            Point de Vente (Caisse)
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Enregistrement des ventes comptant et à crédit
          </p>
        </div>

        {/* Bouton Panier flottant */}
        <button
          type="button"
          onClick={() => setVuePanier(true)}
          className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white shadow-sm hover:opacity-95 self-start sm:self-auto transition-all"
          style={{ background: '#0F3D5E' }}
        >
          <ShoppingCart size={16} />
          <span>Panier ({panier.length})</span>
          {totalPanier > 0 && (
            <span className="ml-1 pl-2 border-l border-white/20 font-bold">
              {formatMontant(totalPanier)}
            </span>
          )}
        </button>
      </div>

      {/* Onglets Vente / Historique */}
      <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl max-w-xs">
        <button
          type="button"
          onClick={() => setTab('vente')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            tab === 'vente' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Nouvelle vente
        </button>
        <button
          type="button"
          onClick={() => setTab('historique')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            tab === 'historique' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Historique ({ventesFiltrees.length})
        </button>
      </div>

      {/* Contenu selon onglet */}
      {tab === 'vente' ? (
        <SalesCatalog
          categories={categories}
          produits={produits}
          categorieChoisie={categorieChoisie}
          onSelectCategorie={setCategorieChoisie}
          searchProd={searchProd}
          onSearchChange={setSearchProd}
          onSelectProduit={(prod) => setProduitSelectionne(prod)}
        />
      ) : (
        <SalesHistoryTable
          ventes={ventesFiltrees}
          onCancelClick={(v) => setVenteToCancel(v)}
          role={role}
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
        modePaiement={modePaiement}
        onModePaiementChange={setModePaiement}
        nomClient={nomClient}
        onNomClientChange={setNomClient}
        onCheckout={handleCheckoutPanier}
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
        }}
      />
    </div>
  );
};

export default Sales;
