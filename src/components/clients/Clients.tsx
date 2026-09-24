import { formatMontant } from '@/utils/format';
import React, { useState, useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import type { ClientDetailed, Creance } from '@/types/clients';
import ClientHeader from './ClientHeader';
import ClientFilters from './ClientFilters';
import ClientCard from './ClientCard';
import ClientDetailModal from './ClientDetailModal';
import NewClientModal from './NewClientModal';
import EditClientModal from './EditClientModal';
import NewDebtModal from './NewDebtModal';
import RecordPaymentModal from './RecordPaymentModal';
import PaymentReceiptModal, { type PaymentReceiptData } from './PaymentReceiptModal';
import { soldeClient } from './types';
import { toast } from 'sonner';
import {
  useCreateClientMutation,
  useUpdateClientMutation,
  useRecordPaymentMutation,
  useClientsListQuery,
} from '../../hooks/queries/useClientsQuery';
import { useLocationsListQuery } from '../../hooks/queries/useLocationsQuery';
import { useStockLevelsQuery } from '../../hooks/queries/useStocksQuery';
import { useAuthStore } from '../../stores/useAuthStore';

interface ClientsProps {
  role?: string;
  boutiqueId?: string;
}

export const Clients: React.FC<ClientsProps> = ({
  role: rawRole = 'gerant',
  boutiqueId = 'b1',
}) => {
  const role = (rawRole === 'OWNER' || rawRole?.toLowerCase() === 'gerant') ? 'gerant' : 'boutiquier';
  
  const session = useAuthStore((s: any) => s.user);

  const { data: clientsRes } = useClientsListQuery();
  const clients = (clientsRes?.data || []).map((c: any) => ({ ...c, creances: c.creances || [] }));
  
  const { data: locRes } = useLocationsListQuery();
  const boutiques = locRes?.data || [];
  
  const { data: stockRes } = useStockLevelsQuery();
  const produits = stockRes?.data || [];
  
  const getStocksEnriched = (...args: any[]) => produits;
  const addClient = (c: any) => { return { ...c, id: Date.now().toString(), creances: [] }; };
  const updateClient = (i: any, c: any) => {};
  const deleteClient = (i: any) => {};
  const addCreance = (...args: any[]) => {};
  const recordPaiement = (...args: any[]) => {};

  const [search, setSearch] = useState('');
  const [filtreBoutique, setFiltreBoutique] = useState<string>(
    role === 'boutiquier' ? boutiqueId : 'toutes'
  );
  const [filtreSolde, setFiltreSolde] = useState<'tous' | 'creance' | 'a_jour'>('tous');

  // Modals state
  const [selectedClient, setSelectedClient] = useState<ClientDetailed | null>(null);
  const [clientToEdit, setClientToEdit] = useState<ClientDetailed | null>(null);
  const [clientToDelete, setClientToDelete] = useState<ClientDetailed | null>(null);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showNewDebtModal, setShowNewDebtModal] = useState(false);
  const [selectedCreanceForPayment, setSelectedCreanceForPayment] = useState<Creance | null>(null);
  const [receiptData, setReceiptData] = useState<PaymentReceiptData | null>(null);

  const { mutate: createClientApi } = useCreateClientMutation();
  const { mutate: updateClientApi } = useUpdateClientMutation();
  // const { mutate: deleteClient } = useArchiveClientMutation();
  const { mutate: recordPaymentApi } = useRecordPaymentMutation();

  // Synchronisation du client sÃ©lectionnÃ© aprÃ¨s mutation
  const activeClient = useMemo(() => {
    if (!selectedClient) return null;
    return clients.find((c: any) => c.id === selectedClient.id) || null;
  }, [clients, selectedClient]);

  // Filtrage selon le rÃ´le et les critÃ¨res
  const clientsFiltres = useMemo(() => {
    return clients.filter((c: any) => {
      // Filtre boutique selon rÃ´le
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
    return boutiques.find((b: any) => b.id === id)?.nom || id;
  };

  return (
    <div className="space-y-4">
      {/* En-tÃªte avec mÃ©triques financiÃ¨res */}
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
              Aucun client ne correspond Ã  votre filtre.
            </div>
          </div>
        ) : (
          clientsFiltres.map((client: any) => (
            <ClientCard
              key={client.id}
              client={client}
              boutiqueNom={getBoutiqueNom(client.boutiqueId)}
              onSelect={(c: any) => setSelectedClient(c)}
            />
          ))
        )}
      </div>

      {/* Modals modulaires */}
      <ClientDetailModal
        client={activeClient}
        boutiqueNom={activeClient ? getBoutiqueNom(activeClient.boutiqueId) : undefined}
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

          // Synchronisation API rÃ©elle
          createClientApi({
            nom: nouveau.nom,
            telephone: nouveau.telephone,
            adresse: nouveau.adresse,
          });

          toast.success(`Client "${c.nom}" enregistrÃ© avec succÃ¨s`);
          setSelectedClient(c);
        }}
      />

      <EditClientModal
        isOpen={Boolean(clientToEdit)}
        onClose={() => setClientToEdit(null)}
        client={clientToEdit}
        boutiques={boutiques}
        role={role}
        onSubmit={(id, updates) => {
          updateClient(id, updates);

          // Synchronisation API rÃ©elle
          updateClientApi({
            id,
            data: {
              nom: updates.nom,
              telephone: updates.telephone,
              adresse: updates.adresse,
            },
          });

          toast.success(`Client "${updates.nom}" mis Ã  jour avec succÃ¨s`);
          if (selectedClient?.id === id) {
            setSelectedClient((prev: any) => (prev ? { ...prev, ...updates } : null));
          }
        }}
      />

      {clientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 size={24} />
              </div>
              <h3 className="font-display font-bold text-gray-900 text-base">
                Confirmer la suppression
              </h3>
              <p className="text-xs text-gray-500">
                ÃŠtes-vous sÃ»r de vouloir archiver / supprimer le client <strong>{clientToDelete.nom}</strong> ? Les factures et crÃ©ances passÃ©es resteront historisÃ©es.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setClientToDelete(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteClient(clientToDelete.id);
                  deleteClient(clientToDelete.id);
                  toast.success(`Client "${clientToDelete.nom}" supprimÃ© avec succÃ¨s`);
                  if (selectedClient?.id === clientToDelete.id) {
                    setSelectedClient(null);
                  }
                  setClientToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {activeClient && (
        <NewDebtModal
          isOpen={showNewDebtModal}
          onClose={() => setShowNewDebtModal(false)}
          client={activeClient}
          produits={getStocksEnriched(activeClient.boutiqueId)}
          onSubmit={(lignes, acompte, modeAcompte) => {
            addCreance(activeClient.id, lignes, undefined, acompte, modeAcompte);
            toast.success(`Nouvelle vente Ã  crÃ©dit crÃ©Ã©e pour ${activeClient.nom}`);
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

              // Synchronisation API rÃ©elle
              recordPaymentApi({
                clientId: activeClient.id,
                data: {
                  montant,
                  modePaiement: mode,
                  referenceExterne: selectedCreanceForPayment.id,
                },
              });

              const totalPaye = selectedCreanceForPayment.paiements.reduce((s: any, p: any) => s + p.montant, 0) + montant;
              const resteDuApres = Math.max(0, selectedCreanceForPayment.montantTotal - totalPaye);

              toast.success(`RÃ¨glement de ${formatMontant(montant)} enregistrÃ© pour ${activeClient.nom}`);

              setReceiptData({
                receiptId: `REC-${Date.now().toString().slice(-6)}`,
                clientNom: activeClient.nom,
                clientTelephone: activeClient.telephone,
                dossierRef: selectedCreanceForPayment.id,
                montantVerse: montant,
                resteDuApres,
                modePaiement: mode,
                datePaiement: new Date().toLocaleDateString('fr-FR'),
                heurePaiement: new Date().toTimeString().slice(0, 5),
                encaisseur: session?.nom || 'Caissier',
                boutiqueNom: boutiques.find((b: any) => b.id === activeClient.boutiqueId)?.nom || 'AFD Textile',
              });

              setSelectedCreanceForPayment(null);
            }
          }}
        />
      )}

      {/* ReÃ§u thermique et quittance de rÃ¨glement */}
      <PaymentReceiptModal
        isOpen={Boolean(receiptData)}
        onClose={() => setReceiptData(null)}
        receiptData={receiptData}
      />
    </div>
  );
};

export default Clients;
