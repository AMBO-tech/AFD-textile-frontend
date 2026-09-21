import React from 'react';
import type { Demande } from '../../data/useMockStore';
import DemandesStockConsultation from './DemandesStockConsultation';
import NewDemandeModal from './NewDemandeModal';
import DemandeValidationModal from './DemandeValidationModal';
import DemandesHeader from '../../features/demandes/components/DemandesHeader';
import DemandesTabs from '../../features/demandes/components/DemandesTabs';
import DemandesStockTab from '../../features/demandes/components/DemandesStockTab';
import DemandesTrackingTab from '../../features/demandes/components/DemandesTrackingTab';
import { useDemandes } from '../../features/demandes/hooks/useDemandes';

type Statut = Demande['statut'];

const STATUTS: { id: Statut; label: string; color: string; bg: string }[] = [
  { id: 'en_attente', label: 'En attente', color: '#F59E0B', bg: '#FFFBEB' },
  { id: 'acceptee', label: 'Acceptée', color: '#22C55E', bg: '#F0FDF4' },
  { id: 'refusee', label: 'Refusée', color: '#EF4444', bg: '#FEF2F2' },
  { id: 'en_transfert', label: 'En transfert', color: '#1E88E5', bg: '#EBF5FB' },
  { id: 'livree', label: 'Livrée', color: '#22C55E', bg: '#F0FDF4' },
];

interface DemandesProps {
  role: 'gerant' | 'boutiquier';
  boutiqueId?: string;
  onNavigate?: (s: string) => void;
}

export const Demandes: React.FC<DemandesProps> = ({ role, boutiqueId = 'b1', onNavigate }) => {
  const {
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
  } = useDemandes({ role, boutiqueId });

  const getStatutCfg = (s: Statut) => STATUTS.find((st) => st.id === s) || STATUTS[0];

  return (
    <div className="space-y-4">
      {/* En-tête épuré */}
      <DemandesHeader
        role={role}
        stocksCritiquesCount={stocksCritiques.length}
        demandesEnAttenteCount={demandesEnAttente.length}
        boutiqueNom={maBoutique?.nom}
        onOpenDemande={() => handleOpenDemande()}
        onNavigate={onNavigate}
      />

      {/* Onglets unifiés */}
      <DemandesTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        role={role}
        demandesEnAttenteCount={demandesEnAttente.length}
        stocksCritiquesCount={stocksCritiques.length}
      />

      {/* VUE 1 : STOCKS (Trié par quantité croissante) */}
      {activeTab === 'stocks' && (
        <DemandesStockTab
          search={search}
          onSearchChange={setSearch}
          filtreCat={filtreCat}
          onFiltreCatChange={setFiltreCat}
          stocks={stocksTries}
          onOpenDemande={handleOpenDemande}
          role={role}
        />
      )}

      {/* VUE 2 : SUIVI DES DEMANDES */}
      {activeTab === 'demandes' && (
        <DemandesTrackingTab
          search={search}
          onSearchChange={setSearch}
          filterStatut={filterStatut}
          onFilterStatutChange={setFilterStatut}
          statuts={STATUTS}
          demandes={demandes}
          demandesFiltrees={demandesFiltrees}
          role={role}
          getBoutiqueName={getBoutiqueName}
          getStatutCfg={getStatutCfg}
          onValidate={(demande, action) => {
            setValidation({ demande, action });
          }}
          onConfirmReception={handleConfirmReception}
        />
      )}

      {/* VUE 3 : DISPONIBILITÉS RÉSEAU */}
      {activeTab === 'reseau' && (
        <DemandesStockConsultation
          produits={allStocks}
          boutiques={boutiques}
          boutiqueCouranteId={boutiqueId}
          role={role}
          onNavigate={onNavigate}
          onCreerDemande={(prod) => {
            handleOpenDemande(prod);
          }}
        />
      )}

      {/* MODAL : NOUVELLE DEMANDE */}
      <NewDemandeModal
        isOpen={showNew}
        onClose={() => {
          setShowNew(false);
          setSelectedProduit(null);
        }}
        selectedProduit={selectedProduit}
        onSubmit={handleSendDemande}
      />

      {/* MODAL : VALIDATION & EXPÉDITION GÉRANT */}
      <DemandeValidationModal
        validation={validation}
        boutiques={boutiques}
        allStocks={allStocks}
        getBoutiqueName={getBoutiqueName}
        onClose={() => setValidation(null)}
        onConfirm={handleConfirmValidation}
      />
    </div>
  );
};

export default Demandes;
