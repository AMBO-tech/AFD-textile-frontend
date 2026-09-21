import React from 'react';
import { Search } from 'lucide-react';
import { type Demande } from '../../../data/useMockStore';
import DemandesTrackingList from '../../../components/demandes/DemandesTrackingList';

type Statut = Demande['statut'];

interface DemandesTrackingTabProps {
  search: string;
  onSearchChange: (val: string) => void;
  filterStatut: Statut | '';
  onFilterStatutChange: (val: Statut | '') => void;
  statuts: { id: Statut; label: string; color: string; bg: string }[];
  demandes: Demande[];
  demandesFiltrees: Demande[];
  role: 'gerant' | 'boutiquier';
  getBoutiqueName: (id: string) => string;
  getStatutCfg: (s: Statut) => { id: Statut; label: string; color: string; bg: string };
  onValidate: (demande: Demande, action: 'acceptee' | 'refusee') => void;
  onConfirmReception: (demande: Demande) => void;
}

export const DemandesTrackingTab: React.FC<DemandesTrackingTabProps> = ({
  search,
  onSearchChange,
  filterStatut,
  onFilterStatutChange,
  statuts,
  demandes,
  demandesFiltrees,
  role,
  getBoutiqueName,
  getStatutCfg,
  onValidate,
  onConfirmReception,
}) => {
  return (
    <div className="space-y-3">
      {/* Recherche */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher une demande…"
          className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 shadow-sm"
        />
      </div>

      {/* Filtres statuts */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
        {[{ label: 'Toutes', id: '' as const }, ...statuts.map((s) => ({ label: s.label, id: s.id }))].map((s) => {
          const count = s.id ? demandes.filter((d) => d.statut === s.id).length : demandes.length;
          const active = filterStatut === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onFilterStatutChange(s.id as Statut | '')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                active
                  ? 'text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
              }`}
              style={active ? { background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' } : {}}
            >
              {s.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Liste des demandes */}
      <DemandesTrackingList
        demandes={demandesFiltrees}
        role={role}
        getBoutiqueName={getBoutiqueName}
        getStatutCfg={getStatutCfg}
        onValidate={onValidate}
        onConfirmReception={onConfirmReception}
      />
    </div>
  );
};

export default DemandesTrackingTab;
