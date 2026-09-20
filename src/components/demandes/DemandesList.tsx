import React from 'react';
import { Clock, CheckCircle, XCircle, ArrowLeftRight, Building2 } from 'lucide-react';
import type { Demande, Boutique } from '../../data/useMockStore';

interface DemandesListProps {
  demandes: Demande[];
  boutiques: Boutique[];
  role: 'gerant' | 'boutiquier';
  onValidateClick?: (demande: Demande) => void;
}

const STATUTS: Record<Demande['statut'], { label: string; bg: string; color: string }> = {
  en_attente: { label: 'En attente', bg: '#FFFBEB', color: '#B45309' },
  acceptee: { label: 'Acceptée', bg: '#F0FDF4', color: '#15803D' },
  refusee: { label: 'Refusée', bg: '#FEF2F2', color: '#B91C1C' },
  en_transfert: { label: 'En transfert', bg: '#EFF6FF', color: '#1D4ED8' },
  livree: { label: 'Livrée', bg: '#F0FDF4', color: '#15803D' },
};

export const DemandesList: React.FC<DemandesListProps> = ({
  demandes,
  boutiques,
  role,
  onValidateClick,
}) => {
  const getNomBoutique = (id: string) => {
    if (id === 'entrepot') return 'Entrepôt Central';
    return boutiques.find((b) => b.id === id)?.nom || id;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="font-display font-bold text-gray-900 text-sm sm:text-base">
          Suivi des Demandes d'Approvisionnement ({demandes.length})
        </div>
      </div>

      <div className="divide-y divide-gray-50 overflow-x-auto">
        {demandes.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-400">
            Aucune demande en cours.
          </div>
        ) : (
          demandes.map((d) => {
            const st = STATUTS[d.statut] || STATUTS.en_attente;
            const canValidate = role === 'gerant' && d.statut === 'en_attente';

            return (
              <div
                key={d.id}
                className="p-3.5 flex items-center justify-between gap-3 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: st.bg, color: st.color }}
                  >
                    <ArrowLeftRight size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-xs truncate">{d.produit}</span>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: st.bg, color: st.color }}
                      >
                        {st.label}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      Demandé par <span className="font-medium text-gray-700">{d.demandeur}</span> • {d.date}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      De <span className="font-semibold text-gray-700">{getNomBoutique(d.boutique_source)}</span> vers{' '}
                      <span className="font-semibold text-gray-700">{getNomBoutique(d.boutique_demande)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div className="font-bold text-gray-900 text-xs sm:text-sm">
                      {d.quantite} {d.unite || 'mètres'}
                    </div>
                    <div className="text-[10px] text-gray-400 uppercase font-semibold">
                      Priorité : {d.priorite}
                    </div>
                  </div>

                  {canValidate && onValidateClick && (
                    <button
                      type="button"
                      onClick={() => onValidateClick(d)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors"
                    >
                      Décider
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DemandesList;
