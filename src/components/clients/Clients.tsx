import React, { useState, useMemo } from 'react';
import { useMockStore, type ClientDetailed, type Creance } from '../../data/useMockStore';
import ClientHeader from './ClientHeader';
import ClientFilters from './ClientFilters';
import ClientCard from './ClientCard';
import ClientDetailModal from './ClientDetailModal';
import NewClientModal from './NewClientModal';
import NewDebtModal from './NewDebtModal';
import RecordPaymentModal from './RecordPaymentModal';
import { soldeClient } from './types';

interface ClientsProps {
  role?: 'gerant' | 'boutiquier';
  boutiqueId?: string;
}

export const Clients: React.FC<ClientsProps> = ({
  role = 'gerant',
  boutiqueId = 'b1',
}) => {
  const {
    clients,
    produits,
    boutiques,
    addClient,
    addCreance,
    recordPaiement,
    session,
  } = useMockStore();

  const [search, setSearch] = useState('');
  const [filtreBoutique, setFiltreBoutique] = useState<string>(
    role === 'boutiquier' ? boutiqueId : 'toutes'
  );
  const [filtreSolde, setFiltreSolde] = useState<'tous' | 'creance' | 'a_jour'>('tous');

  // Modals state
  const [selectedClient, setSelectedClient] = useState<ClientDetailed | null>(null);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showNewDebtModal, setShowNewDebtModal] = useState(false);
  const [selectedCreanceForPayment, setSelectedCreanceForPayment] = useState<Creance | null>(null);

  // Synchronisation du client sélectionné après mutation
  const activeClient = useMemo(() => {
    if (!selectedClient) return null;
    return clients.find((c) => c.id === selectedClient.id) || null;
  }, [clients, selectedClient]);

  // Filtrage selon le rôle et les critères
  const clientsFiltres = useMemo(() => {
    return clients.filter((c) => {
      // Filtre boutique selon rôle
      if (role === 'boutiquier') {
        if (c.boutiqueId !== boutiqueId) return false;
      } else if (filtreBoutique !== 'toutes') {
        if (c.boutiqueId !== filtreBoutique) return false;
      }

      // Filtre solde
      const solde = soldeClient(c);
      if (filtreSolde === 'creance' && solde <= 0) return false;
      if (filtreSolde === 'a_jour' && solde > 0) return false;

      // Recherche texte
      if (search.trim()) {
        const query = search.toLowerCase();
        return (
          c.nom.toLowerCase().includes(query) ||
          c.telephone.toLowerCase().includes(query) ||
          c.adresse.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [clients, role, boutiqueId, filtreBoutique, filtreSolde, search]);

  const getBoutiqueNom = (id: string) => {
    return boutiques.find((b) => b.id === id)?.nom || id;
  };

  return (
    <div className="space-y-4">
      {/* En-tête avec métriques financières */}
      <ClientHeader
        clients={clientsFiltres}
        role={role}
        onOpenNewClient={() => setShowNewClientModal(true)}
      />

      {/* Filtres et recherche */}
      <ClientFilters
        search={search}
        onSearchChange={setSearch}
        filtreBoutique={filtreBoutique}
        onBoutiqueChange={setFiltreBoutique}
        filtreSolde={filtreSolde}
        onSoldeChange={setFiltreSolde}
        boutiques={boutiques}
        role={role}
      />

      {/* Liste des cartes clients */}
      <div className="space-y-2.5">
        {clientsFiltres.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="text-gray-400 text-sm">
              Aucun client ne correspond à votre filtre.
            </div>
          </div>
        ) : (
          clientsFiltres.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              boutiqueNom={getBoutiqueNom(client.boutiqueId)}
              onSelect={(c) => setSelectedClient(c)}
            />
          ))
        )}
      </div>

      {/* Modals modulaires */}
      <ClientDetailModal
        client={activeClient}
        onClose={() => setSelectedClient(null)}
        onOpenNewDebt={() => setShowNewDebtModal(true)}
        onOpenPayment={(cr) => setSelectedCreanceForPayment(cr)}
      />

      <NewClientModal
        isOpen={showNewClientModal}
        onClose={() => setShowNewClientModal(false)}
        boutiques={boutiques}
        defaultBoutiqueId={role === 'boutiquier' ? boutiqueId : 'b1'}
        role={role}
        onSubmit={(nouveau) => {
          const c = addClient(nouveau);
          setSelectedClient(c);
        }}
      />

      {activeClient && (
        <NewDebtModal
          isOpen={showNewDebtModal}
          onClose={() => setShowNewDebtModal(false)}
          client={activeClient}
          produits={produits}
          onSubmit={(lignes) => {
            addCreance(activeClient.id, lignes);
          }}
        />
      )}

      {activeClient && (
        <RecordPaymentModal
          isOpen={Boolean(selectedCreanceForPayment)}
          onClose={() => setSelectedCreanceForPayment(null)}
          client={activeClient}
          creance={selectedCreanceForPayment}
          onSubmit={(montant, mode) => {
            if (selectedCreanceForPayment) {
              recordPaiement(
                activeClient.id,
                selectedCreanceForPayment.id,
                montant,
                mode,
                session?.nom
              );
            }
          }}
        />
      )}
    </div>
  );
};

export default Clients;
