import React from 'react';
import { Search, X, Building2, Warehouse, Layers, Filter } from 'lucide-react';
import { ACTION_CONFIG } from './types';

export interface EmplacementFilterItem {
  id: string;
  nom: string;
  lieu: string;
  type: 'global' | 'entrepot' | 'boutique';
}

interface HistoriqueFiltersProps {
  role: 'gerant' | 'boutiquier';
  search: string;
  onSearchChange: (val: string) => void;
  filtreBoutique: string;
  onFiltreBoutiqueChange: (val: string) => void;
  filtreAction: string;
  onFiltreActionChange: (val: string) => void;
  emplacements: EmplacementFilterItem[];
  boutiqueCounts: Record<string, number>;
  actionCounts: Record<string, number>;
}

export const HistoriqueFilters: React.FC<HistoriqueFiltersProps> = ({
  role,
  search,
  onSearchChange,
  filtreBoutique,
  onFiltreBoutiqueChange,
  filtreAction,
  onFiltreActionChange,
  emplacements,
  boutiqueCounts,
  actionCounts,
}) => {
  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-3.5">
      {/* 1. Recherche instantanée */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher par action, tissu, utilisateur, montant (ex: 27 000, Amadou)…"
          className="w-full pl-10 pr-9 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white rounded-2xl border border-gray-200/80 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all placeholder:text-gray-400"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 w-5 h-5 rounded-full flex items-center justify-center hover:bg-gray-200"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* 2. Filtre par Boutique (Gérant seulement) */}
      {role === 'gerant' && (
        <div>
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 size={13} className="text-blue-500" />
              Filtrer par Emplacement / Boutique
            </span>
            <span className="text-[11px] text-gray-400">
              {filtreBoutique === 'tous'
                ? 'Vue consolidée'
                : emplacements.find((e) => e.id === filtreBoutique)?.nom}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
            {emplacements.map((emp) => {
              const active = filtreBoutique === emp.id;
              const count = boutiqueCounts[emp.id] || 0;
              const Icon =
                emp.type === 'entrepot'
                  ? Warehouse
                  : emp.type === 'global'
                  ? Layers
                  : Building2;

              return (
                <button
                  key={emp.id}
                  onClick={() => onFiltreBoutiqueChange(emp.id)}
                  className={`group flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 border ${
                    active
                      ? 'text-white border-transparent shadow-md'
                      : 'bg-gray-50 text-gray-700 border-gray-100 hover:bg-gray-100/80 hover:border-gray-200'
                  }`}
                  style={active ? { background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' } : {}}
                >
                  <Icon
                    size={14}
                    className={active ? 'text-blue-200' : 'text-gray-500 group-hover:text-blue-600'}
                  />
                  <span>{emp.nom}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold transition-colors ${
                      active
                        ? 'bg-white/20 text-white'
                        : 'bg-white text-gray-500 border border-gray-200'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Filtre par Catégorie d'Action */}
      <div>
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Filter size={13} className="text-amber-500" />
            Filtrer par Type d'Action
          </span>
          {filtreAction !== 'toutes' && (
            <button
              onClick={() => onFiltreActionChange('toutes')}
              className="text-[11px] font-semibold text-blue-600 hover:underline"
            >
              Afficher toutes les actions
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
          {Object.entries(ACTION_CONFIG).map(([key, config]) => {
            const active = filtreAction === key;
            const Icon = config.icon;
            const count = actionCounts[key] || 0;

            return (
              <button
                key={key}
                onClick={() => onFiltreActionChange(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 active:scale-95 border ${
                  active
                    ? 'shadow-sm font-bold ring-2 ring-offset-1'
                    : 'bg-white text-gray-600 border-gray-200/80 hover:bg-gray-50 hover:border-gray-300'
                }`}
                style={{
                  backgroundColor: active ? config.badgeBg : undefined,
                  borderColor: active ? config.color : undefined,
                  color: active ? config.color : undefined,
                }}
              >
                <Icon size={13} color={active ? config.color : '#94A3B8'} />
                <span>{config.label}</span>
                <span
                  className="text-[10px] px-1.5 py-0.2 rounded-full font-bold"
                  style={{
                    backgroundColor: active ? config.bg : '#F1F5F9',
                    color: active ? config.color : '#64748B',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HistoriqueFilters;
