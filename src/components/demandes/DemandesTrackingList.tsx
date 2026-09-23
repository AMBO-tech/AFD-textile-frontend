import React from 'react';
import { MessageSquare } from 'lucide-react';


interface StatutConfig {
  id: Demande['statut'];
  label: string;
  color: string;
  bg: string;
}

interface DemandesTrackingListProps {
  demandes: Demande[];
  role: 'gerant' | 'boutiquier';
  getBoutiqueName: (id: string) => string;
  getStatutCfg: (s: Demande['statut']) => StatutConfig;
  onValidate: (demande: Demande, action: 'acceptee' | 'refusee') => void;
}

export const DemandesTrackingList: React.FC<DemandesTrackingListProps> = ({
  demandes,
  role,
  getBoutiqueName,
  getStatutCfg,
  onValidate,
}) => {
  if (demandes.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center text-gray-400 shadow-sm border border-gray-100">
        <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
        <p className="text-sm">Aucune demande</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {demandes.map((d) => {
        const st = getStatutCfg(d.statut);
        return (
          <div key={d.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-gray-900">{d.produit}</span>
                  <span
                    className="text-[11px] font-medium px-2 py-0.5 rounded-md"
                    style={{ background: st.bg, color: st.color }}
                  >
                    {st.label}
                  </span>
                  {d.priorite === 'haute' && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-50 text-red-600">
                      Urgent
                    </span>
                  )}
                </div>

                <div className="text-xs text-gray-600 mt-1">
                  <strong className="text-gray-900">{d.quantite} {d.unite ?? 'unités'}</strong> · {getBoutiqueName(d.boutique_demande)}
                </div>

                <div className="text-[11px] text-gray-400 mt-1">
                  {d.date} · {d.demandeur}
                </div>
              </div>

              {/* Actions Gérant */}
              {role === 'gerant' && d.statut === 'en_attente' && (
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => onValidate(d, 'acceptee')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all"
                    style={{ background: '#22C55E' }}
                  >
                    Valider
                  </button>
                  <button
                    onClick={() => onValidate(d, 'refusee')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 active:scale-95 transition-all"
                  >
                    Refuser
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DemandesTrackingList;
