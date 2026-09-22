import React from 'react';
import { Users, ShoppingBag, Plus } from 'lucide-react';
import type { ClientDetailed } from '../../data/useMockStore';

interface ClientHeaderProps {
  clients: ClientDetailed[];
  role: 'gerant' | 'boutiquier';
  onOpenNewClient: () => void;
}

export const ClientHeader: React.FC<ClientHeaderProps> = ({
  clients,
  role,
  onOpenNewClient,
}) => {
  const totalClients = clients.length;
  const clientsAvecAchats = clients.filter((c) => c.creances && c.creances.length > 0);

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-gray-900 text-xl sm:text-2xl">
            Répertoire Clients
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            {role === 'gerant'
              ? 'Répertoire consolidé des clients et suivi des achats'
              : 'Gestion des clients et suivi des achats boutique'}
          </p>
        </div>
        <button
          onClick={onOpenNewClient}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white shadow-sm transition-all hover:opacity-95 self-start sm:self-auto cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
        >
          <Plus size={16} />
          Nouveau client
        </button>
      </div>

      {/* KPIs sans créances */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Total clients</span>
            <Users size={16} className="text-blue-600" />
          </div>
          <div className="font-display font-bold text-gray-900 text-lg sm:text-xl">
            {totalClients}
          </div>
          <span className="text-[11px] text-gray-400">Comptes enregistrés</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Clients actifs</span>
            <ShoppingBag size={16} className="text-emerald-600" />
          </div>
          <div className="font-display font-bold text-gray-900 text-lg sm:text-xl">
            {clientsAvecAchats.length}
          </div>
          <span className="text-[11px] text-emerald-600">
            {totalClients > 0
              ? `${Math.round((clientsAvecAchats.length / totalClients) * 100)}% avec historique d'achat`
              : 'Aucun achat'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ClientHeader;
