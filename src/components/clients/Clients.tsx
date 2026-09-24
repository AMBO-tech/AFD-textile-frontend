import React, { useState, useMemo, useDeferredValue } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Client } from '@/types/clients';
import ClientHeader from './ClientHeader';
import ClientFilters from './ClientFilters';
import ClientCard from './ClientCard';
import ClientDetailModal from './ClientDetailModal';
import NewClientModal from './NewClientModal';
import EditClientModal from './EditClientModal';
import NewDebtModal from './NewDebtModal';
import RecordPaymentModal from './RecordPaymentModal';
import { soldeClient } from './types';
import {
  useArchiveClientMutation,
  useClientsListQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
} from '../../hooks/queries/useClientsQuery';
import { useLocationsListQuery } from '../../hooks/queries/useLocationsQuery';
import { getErrorMessage } from '../../services/api';
import { useAuthStore } from '../../stores/useAuthStore';

/** Plafond imposé par l'API sur les listes paginées. */
const API_PAGE_MAX = 100;
/** Fiche technique créée par l'API pour les ventes comptoir sans client : jamais affichée. */
const CLIENT_SYSTEME = 'Client Comptoir Anonyme';

type FiltreSolde = 'tous' | 'creance' | 'a_jour';

interface ClientsProps {
  role?: string;
}

/** Clients & créances : c'est ici (et non en caisse) que se font les ventes à crédit et leurs règlements. */
export const Clients: React.FC<ClientsProps> = ({ role: rawRole = 'gerant' }) => {
  const role = rawRole === 'OWNER' || rawRole?.toLowerCase() === 'gerant' ? 'gerant' : 'boutiquier';
  const user = useAuthStore((s) => s.user);
  const boutiqueImposee = role === 'boutiquier' ? (user?.locationId ?? null) : null;

  const [search, setSearch] = useState('');
  const [filtreSolde, setFiltreSolde] = useState<FiltreSolde>('tous');
  const recherche = useDeferredValue(search.trim());

  const { data: clientsRes, isLoading } = useClientsListQuery({
    limit: API_PAGE_MAX,
    ...(recherche ? { search: recherche } : {}),
    ...(filtreSolde === 'creance' ? { hasDebt: true } : {}),
  });
  const { data: locRes } = useLocationsListQuery();
  const boutiques = useMemo(() => (locRes?.data ?? []).filter((b) => b.type === 'BOUTIQUE'), [locRes]);

  const clients = useMemo(
    () =>
      (clientsRes?.data ?? [])
        .filter((c) => c.nom !== CLIENT_SYSTEME)
        .filter((c) => filtreSolde !== 'a_jour' || soldeClient(c) <= 0),
    [clientsRes, filtreSolde],
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showNewDebtModal, setShowNewDebtModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Toujours la version à jour de la liste (solde recalculé après une vente ou un règlement)
  const activeClient = clients.find((c) => c.id === selectedId) ?? null;

  const { mutateAsync: createClient } = useCreateClientMutation();
  const { mutateAsync: updateClient } = useUpdateClientMutation();
  const { mutateAsync: archiveClient, isPending: isArchiving } = useArchiveClientMutation();

  const handleCreate = async (data: Parameters<typeof createClient>[0]) => {
    try {
      const cree = await createClient(data);
      toast.success(`Client "${cree.nom}" enregistré.`);
      setSelectedId(cree.id);
    } catch (error) {
      throw new Error(getErrorMessage(error, "Le client n'a pas pu être créé."));
    }
  };

  const handleUpdate = async (id: string, data: Parameters<typeof updateClient>[0]['data']) => {
    try {
      await updateClient({ id, data });
      toast.success('Client mis à jour.');
    } catch (error) {
      throw new Error(getErrorMessage(error, "Les modifications n'ont pas pu être enregistrées."));
    }
  };

  const handleArchive = async () => {
    if (!clientToDelete) return;
    try {
      await archiveClient(clientToDelete.id);
      toast.success(`Client "${clientToDelete.nom}" archivé.`);
      if (selectedId === clientToDelete.id) setSelectedId(null);
      setClientToDelete(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "L'archivage a échoué."));
    }
  };

  return (
    <div className="space-y-4">
      <ClientHeader clients={clients} role={role} onOpenNewClient={() => setShowNewClientModal(true)} />

      <ClientFilters
        search={search}
        onSearchChange={setSearch}
        filtreSolde={filtreSolde}
        onSoldeChange={setFiltreSolde}
        role={role}
      />

      <div className="space-y-2.5">
        {isLoading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 text-sm text-gray-400">
            Chargement des clients…
          </div>
        ) : clients.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm text-sm text-gray-400">
            Aucun client ne correspond à votre filtre.
          </div>
        ) : (
          clients.map((client) => (
            <ClientCard key={client.id} client={client} onSelect={(c) => setSelectedId(c.id)} />
          ))
        )}
      </div>

      <ClientDetailModal
        client={activeClient}
        onClose={() => setSelectedId(null)}
        onOpenNewDebt={() => setShowNewDebtModal(true)}
        onOpenPayment={() => setShowPaymentModal(true)}
        onEdit={() => setClientToEdit(activeClient)}
        onArchive={() => setClientToDelete(activeClient)}
      />

      <NewClientModal
        isOpen={showNewClientModal}
        onClose={() => setShowNewClientModal(false)}
        onSubmit={handleCreate}
      />

      <EditClientModal
        isOpen={Boolean(clientToEdit)}
        onClose={() => setClientToEdit(null)}
        client={clientToEdit}
        onSubmit={handleUpdate}
      />

      {activeClient && showNewDebtModal && (
        <NewDebtModal
          isOpen
          onClose={() => setShowNewDebtModal(false)}
          client={activeClient}
          boutiques={boutiques}
          boutiqueImposee={boutiqueImposee}
        />
      )}

      {activeClient && showPaymentModal && (
        <RecordPaymentModal
          isOpen
          onClose={() => setShowPaymentModal(false)}
          client={activeClient}
          boutiques={boutiques}
          boutiqueImposee={boutiqueImposee}
        />
      )}

      {clientToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 size={24} />
              </div>
              <h3 className="font-display font-bold text-gray-900 text-base">Archiver ce client ?</h3>
              <p className="text-xs text-gray-500">
                <strong>{clientToDelete.nom}</strong> n'apparaîtra plus dans les listes. Ses factures et règlements
                restent dans l'historique.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setClientToDelete(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleArchive}
                disabled={isArchiving}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-60"
              >
                {isArchiving ? 'Archivage…' : 'Archiver'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
