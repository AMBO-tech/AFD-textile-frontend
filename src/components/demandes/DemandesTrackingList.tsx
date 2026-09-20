import React from 'react';
import { MessageSquare, Truck, Check, Store } from 'lucide-react';
import type { Demande } from '../../data/useMockStore';

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
  onTransfer?: (demande: Demande) => void;
  onConfirmReception?: (demande: Demande) => void;
}

export const DemandesTrackingList: React.FC<DemandesTrackingListProps> = ({
  demandes,
  role,
  getBoutiqueName,
  getStatutCfg,
  onValidate,
  onTransfer,
  onConfirmReception,
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
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
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

                <div className="text-xs text-gray-600 mt-1 flex flex-wrap items-center gap-1.5">
                  <strong className="text-gray-900">{d.quantite} {d.unite ?? 'mètres'}</strong>
                  <span>demandés par</span>
                  <span className="font-semibold text-blue-900 bg-blue-50 px-1.5 py-0.2 rounded">
                    {getBoutiqueName(d.boutique_demande)}
                  </span>
                </div>

                {d.boutique_source && d.boutique_source !== 'reseau' && (
                  <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                    <Truck size={12} className="text-blue-500 shrink-0" />
                    <span>
                      Expédition : <strong className="text-gray-700">{getBoutiqueName(d.boutique_source)}</strong>
                    </span>
                  </div>
                )}

                {d.statut === 'en_attente' && (
                  <div className="text-[11px] text-amber-700 font-medium mt-1 flex items-center gap-1">
                    <Store size={12} className="text-amber-500 shrink-0" />
                    <span>Diffusion réseau · Premier gérant qui expédie prend en charge</span>
                  </div>
                )}

                <div className="text-[11px] text-gray-400 mt-1">
                  {d.date} · {d.demandeur}
                </div>
              </div>

              {/* Actions selon le statut et le rôle */}
              <div className="flex gap-1.5 flex-shrink-0 self-end sm:self-auto">
                {/* Pour le gérant : prendre en charge et expédier directement si en attente */}
                {role === 'gerant' && d.statut === 'en_attente' && (
                  <>
                    <button
                      onClick={() => onValidate(d, 'acceptee')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                      style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
                      title="Choisir l'emplacement source avec stock disponible et expédier"
                    >
                      <Truck size={13} />
                      <span>Expédier</span>
                    </button>
                    <button
                      onClick={() => onValidate(d, 'refusee')}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 active:scale-95 transition-all cursor-pointer"
                    >
                      Refuser
                    </button>
                  </>
                )}

                {/* Pour la boutique demandeuse : confirmer la réception une fois en transfert */}
                {d.statut === 'en_transfert' && (
                  <button
                    onClick={() => onConfirmReception?.(d)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-green-600 shadow-sm hover:bg-green-700 active:scale-95 transition-all cursor-pointer"
                    title="Confirmer la réception de la marchandise en magasin"
                  >
                    <Check size={13} />
                    <span>Réceptionner</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DemandesTrackingList;
