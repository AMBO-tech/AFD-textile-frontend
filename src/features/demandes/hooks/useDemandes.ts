import { useState, useMemo } from 'react';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useLocationsListQuery } from '../../../hooks/queries/useLocationsQuery';
import { useStockLevelsQuery } from '../../../hooks/queries/useStocksQuery';
import { toast } from 'sonner';
import type { StockLevel } from '../../../types/stocks';

type Statut = 'en_attente' | 'en_transfert' | 'livree' | 'refusee';

interface UseDemandesProps {
  role: 'gerant' | 'boutiquier';
  boutiqueId?: string;
}

export const useDemandes = ({ role, boutiqueId = 'b1' }: UseDemandesProps) => {
  const { user } = useAuthStore();
  const { data: locData } = useLocationsListQuery();
  const boutiques = locData?.data ?? [];

  // Temporary fallback array for demandes (until the API is ready)
  const demandes: any[] = []; 

  const { data: stockDataGlobal } = useStockLevelsQuery({ limit: 1000 });
  const allStocks = stockDataGlobal?.data ?? [];

  const { data: stockDataBoutique } = useStockLevelsQuery({ locationId: boutiqueId, limit: 1000 });
  const boutiqueStocks = stockDataBoutique?.data ?? [];

  const [activeTab, setActiveTab] = useState<'stocks' | 'demandes' | 'reseau'>(
    role === 'gerant' ? 'demandes' : 'stocks'
  );

  const [search, setSearch] = useState('');
  const [filtreCat, setFiltreCat] = useState<string>('toutes');
  const [filterStatut, setFilterStatut] = useState<Statut | ''>('');

  const [showNew, setShowNew] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState<StockLevel | null>(null);
  const [validation, setValidation] = useState<{ demande: any; action: 'acceptee' | 'refusee' } | null>(null);

  const maBoutique = boutiques.find((b) => b.id === boutiqueId) || boutiques[0];

  const getBoutiqueName = (id: string) => {
    if (id === 'entrepot' || id === 'b-ent') return 'Entrepôt Central';
    return boutiques.find((b) => b.id === id)?.nom ?? id;
  };

  const produitsEmplacement = useMemo(() => {
    return role === 'gerant' ? allStocks : boutiqueStocks;
  }, [role, allStocks, boutiqueStocks]);

  const stocksTries = useMemo(() => {
    return produitsEmplacement
      .filter((p: StockLevel) => {
        const matchSearch =
          p.produitNom.toLowerCase().includes(search.toLowerCase()) ||
          p.produitReference.toLowerCase().includes(search.toLowerCase());
        const matchCat = true; // Categories not available directly on StockLevel yet
        return matchSearch && matchCat;
      })
      .sort((a: StockLevel, b: StockLevel) => a.quantite - b.quantite);
  }, [produitsEmplacement, search, filtreCat]);

  const stocksCritiques = useMemo(() => {
    return produitsEmplacement.filter((p: StockLevel) => p.estEnAlerte);
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

  const handleOpenDemande = (p?: StockLevel) => {
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
    toast.error("Fonctionnalité en cours de migration (API Réelle)");
    setValidation(null);
  };

  const handleSendDemande = (data: {
    produit: string;
    quantite: number;
    unite: string;
    priorite: 'haute' | 'moyenne' | 'basse';
  }) => {
    toast.error("Fonctionnalité en cours de migration (API Réelle)");
    setShowNew(false);
    setSelectedProduit(null);
  };

  const handleConfirmReception = (demande: any) => {
    toast.error("Fonctionnalité en cours de migration (API Réelle)");
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
    allStocks,
  };
};

export default useDemandes;