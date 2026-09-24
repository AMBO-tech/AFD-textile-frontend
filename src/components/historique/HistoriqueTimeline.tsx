import React from 'react';
import { Calendar, History, Warehouse, Building2, Clock, RefreshCw } from 'lucide-react';
import type { HistoryItem } from './types';
import { ACTION_CONFIG } from './types';


interface HistoriqueTimelineProps {
  groupesParDate: Record<string, HistoryItem[]>;
  boutiques: Boutique[];
  getActionCategory: (item: HistoryItem) => string;
  formatDateLabel: (dateStr: string) => string;
  onResetFilters: () => void;
  filtreBoutiqueNom: string;
  filtreActionLabel: string;
}

export const HistoriqueTimeline: React.FC<HistoriqueTimelineProps> = ({
  groupesParDate,
  boutiques,
  getActionCategory,
  formatDateLabel,
  onResetFilters,
  filtreBoutiqueNom,
  filtreActionLabel,
}) => {
  const getBoutiqueInfo = (boutiqueId: string) => {
    if (boutiqueId === 'entrepot')
      return { nom: 'Entrepôt Central', lieu: 'Dakar', type: 'entrepot' };
    const b = boutiques.find((x: any) => x.id === boutiqueId);
    return b
      ? { nom: b.nom, lieu: b.lieu, type: 'boutique' }
      : { nom: 'Boutique', lieu: '', type: 'boutique' };
  };

  const dates = Object.keys(groupesParDate);
  const totalItems = dates.reduce((acc, d) => acc + groupesParDate[d].length, 0);

  if (totalItems === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto text-gray-400">
          <History size={28} />
        </div>
        <h3 className="font-display font-bold text-base text-gray-900">
          Aucune opération trouvée
        </h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Aucun événement dans l'historique ne correspond aux filtres sélectionnés ({filtreBoutiqueNom} · {filtreActionLabel}).
        </p>
        <button
          onClick={onResetFilters}
          className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
        >
          <RefreshCw size={13} />
          Réinitialiser les filtres
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupesParDate).map(([dateStr, items]) => (
        <div key={dateStr} className="space-y-3">
          {/* Header de la journée */}
          <div className="flex items-center gap-2.5 px-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-200/80 shadow-xs px-3 py-1 rounded-xl">
              <Calendar size={13} className="text-blue-600" />
              <span>{formatDateLabel(dateStr)}</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
            <span className="text-[11px] font-semibold text-gray-400">
              {items.length} opération{items.length > 1 ? 's' : ''}
            </span>
          </div>

          {/* Cartes d'événements avec axe temporel */}
          <div className="space-y-2.5 pl-2 relative">
            {/* Ligne verticale timeline */}
            <div className="absolute left-6 top-3 bottom-3 w-0.5 bg-gradient-to-b from-blue-200 via-gray-200 to-transparent -z-0" />

            {items.map((item: any) => {
              const cat = getActionCategory(item);
              const cfg = ACTION_CONFIG[cat] || ACTION_CONFIG.vente;
              const Icon = cfg.icon;
              const boutique = getBoutiqueInfo(item.boutique);
              const heure = item.date.split(' ')[1] || '00:00';

              return (
                <div
                  key={item.id}
                  className="relative bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 flex items-start gap-3.5 z-10"
                >
                  {/* Badge Icône d'action avec halo */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs border transition-transform hover:scale-105"
                    style={{
                      backgroundColor: cfg.bg,
                      borderColor: cfg.border,
                      color: cfg.color,
                    }}
                  >
                    <Icon size={18} />
                  </div>

                  {/* Contenu de l'événement */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Badge d'action */}
                        <span
                          className="text-xs font-bold px-2.5 py-0.5 rounded-full border"
                          style={{
                            backgroundColor: cfg.badgeBg,
                            borderColor: cfg.border,
                            color: cfg.color,
                          }}
                        >
                          {item.action}
                        </span>

                        {/* Badge Boutique */}
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-700 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md">
                          {boutique.type === 'entrepot' ? (
                            <Warehouse size={11} className="text-blue-600" />
                          ) : (
                            <Building2 size={11} className="text-blue-600" />
                          )}
                          {boutique.nom}
                        </span>
                      </div>

                      {/* Timestamp */}
                      <div className="flex items-center gap-1 text-xs font-medium text-gray-400">
                        <Clock size={12} />
                        <span>{heure}</span>
                      </div>
                    </div>

                    {/* Détails du journal */}
                    <p className="text-sm font-medium text-gray-800 mt-2 leading-relaxed">
                      {item.details}
                    </p>

                    {/* Auteur / Responsable */}
                    <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-gray-50 text-xs text-gray-500">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-slate-600 to-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                        {item.utilisateur
                          .split(' ')
                          .map((n: any) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                      <span>
                        Enregistré par <strong className="text-gray-700 font-semibold">{item.utilisateur}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoriqueTimeline;
