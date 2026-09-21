import { useState, useMemo } from 'react';
import { useMockStore, type Demande, type StockEnriched } from '../../../data/useMockStore';
import { toast } from 'sonner';

type Statut = Demande['statut'];

interface UseDemandesProps {
  role: 'gerant' | 'boutiquier';
  boutiqueId?: string;
}

export const useDemandes = ({ role, boutiqueId = 'b1' }: UseDemandesProps) => {
  const {
    demandes,
    boutiques,
    session,
    createDemande,
    updateDemandeStatut,
    getStocksEnriched,
    stocks,
    produits,
  } = useMockStore();

  const [activeTab, setActiveTab] = useState<'stocks' | 'demandes' | 'reseau'>(
    role === 'gerant' ? 'demandes' : 'stocks'
  );

  const [search, setSearch] = useState('');
  const [filtreCat, setFiltreCat] = useState<string>('toutes');
  const [filterStatut, setFilterStatut] = useState<Statut | ''>('');

  const [showNew, setShowNew] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState<StockEnriched | null>(null);
  const [validation, setValidation] = useState<{ demande: Demande; action: 'acceptee' | 'refusee' } | null>(null);

  const maBoutique = boutiques.find((b) => b.id === boutiqueId) || boutiques[0];

  const getBoutiqueName = (id: string) => {
    if (id === 'entrepot' || id === 'b-ent') return 'Entrepôt Central';
    return boutiques.find((b) => b.id === id)?.nom ?? id;
  };

  const produitsEmplacement = useMemo(() => {
    return role === 'gerant' ? getStocksEnriched() : getStocksEnriched(boutiqueId);
  }, [getStocksEnriched, role, boutiqueId, stocks, produits]);

  const stocksTries = useMemo(() => {
    return produitsEmplacement
      .filter((p: StockEnriched) => {
        const matchSearch =
          p.nom.toLowerCase().includes(search.toLowerCase()) ||
          p.categorie.toLowerCase().includes(search.toLowerCase()) ||
          (p.couleur && p.couleur.toLowerCase().includes(search.toLowerCase()));
        const matchCat = filtreCat === 'toutes' || p.categorie === filtreCat;
        return matchSearch && matchCat;
      })
      .sort((a: StockEnriched, b: StockEnriched) => a.quantite - b.quantite);
  }, [produitsEmplacement, search, filtreCat]);

  const stocksCritiques = useMemo(() => {
    return produitsEmplacement.filter((p: StockEnriched) => p.quantite <= p.seuil);
  }, [produitsEmplacement]);

  const demandesEnAttente = demandes.filter((d) => d.statut === 'en_attente');

  const demandesFiltrees = demandes.filter((d) => {
    const matchStatut = !filterStatut || d.statut === filterStatut;
    const matchSearch =
      d.produit.toLowerCase().includes(search.toLowerCase()) ||
      (d.demandeur && d.demandeur.toLowerCase().includes(search.toLowerCase()));
    const matchBoutique = role === 'gerant' || d.boutique_demande === boutiqueId;
    return matchStatut && matchSearch && matchBoutique;
  });

  const handleOpenDemande = (p?: StockEnriched) => {
    setSelectedProduit(p || null);
    setShowNew(true);
  };

  const handleConfirmValidation = ({
    demandeId,
    action,
    sourceBoutiqueId,
    quantite,
    motifRefus,
  }: {
    demandeId: string;
    action: 'acceptee' | 'refusee';
    sourceBoutiqueId?: string;
    quantite?: number;
    motifRefus?: string;
  }) => {
    if (action === 'refusee') {
      updateDemandeStatut(demandeId, 'refusee', undefined, undefined, session?.nom || 'Gérant');
      toast.error(`Demande #${demandeId} refusée : ${motifRefus || 'Non accordée'}.`);
    } else {
      if (!sourceBoutiqueId) {
        toast.error("Veuillez sélectionner un emplacement source d'expédition.");
        return;
      }
      const targetDemande = demandes.find((d) => d.id === demandeId);
      const isEntrepot = sourceBoutiqueId === 'entrepot' || sourceBoutiqueId === 'b-ent';
      const nomSource = isEntrepot
        ? 'Entrepôt Central'
        : (boutiques.find((b) => b.id === sourceBoutiqueId)?.nom || sourceBoutiqueId);
      const nomDest = getBoutiqueName(targetDemande?.boutique_demande || '');

      updateDemandeStatut(
        demandeId,
        'en_transfert',
        quantite,
        sourceBoutiqueId,
        session?.nom || 'Gérant'
      );

      toast.success(
        `Transfert validé ! Expédition de ${quantite} ${targetDemande?.unite || 'm'} depuis ${nomSource} vers ${nomDest}.`
      );
    }
    setValidation(null);
  };

  const handleSendDemande = (data: {
    produit: string;
    quantite: number;
    unite: string;
    priorite: Demande['priorite'];
  }) => {
    createDemande({
      produit: data.produit,
      quantite: data.quantite,
      unite: data.unite,
      boutique_demande: role === 'boutiquier' ? boutiqueId : (session?.boutiqueId || 'b1'),
      boutique_source: 'reseau',
      priorite: data.priorite,
      demandeur: session?.nom || (role === 'gerant' ? 'Gérant' : 'Boutiquier'),
    });

    setShowNew(false);
    setSelectedProduit(null);
    toast.success(`Demande de ${data.quantite} ${data.unite} de ${data.produit} diffusée à tout le réseau.`);
  };

  const handleConfirmReception = (demande: Demande) => {
    updateDemandeStatut(demande.id, 'livree', demande.quantite, demande.boutique_source, session?.nom);
    toast.success(`Réassort réceptionné ! ${demande.quantite} ${demande.unite || 'm'} de ${demande.produit} ajoutés au stock.`);
  };

  return {
    demandes,
    boutiques,
    activeTab,
    setActiveTab,
    search,
    setSearch,
    filtreCat,
    setFiltreCat,
    filterStatut,
    setFilterStatut,
    showNew,
    setShowNew,
    selectedProduit,
    setSelectedProduit,
    validation,
    setValidation,
    maBoutique,
    getBoutiqueName,
    stocksTries,
    stocksCritiques,
    demandesEnAttente,
    demandesFiltrees,
    handleOpenDemande,
    handleConfirmValidation,
    handleSendDemande,
    handleConfirmReception,
    allStocks: getStocksEnriched(),
  };
};

export default useDemandes;
