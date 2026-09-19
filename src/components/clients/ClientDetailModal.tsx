import React from 'react';
import { X, Plus, CreditCard, Phone, MapPin, CheckCircle, Clock } from 'lucide-react';
import type { ClientDetailed, Creance } from '../../data/useMockStore';
import { soldeClient } from './types';
import { formatMontant } from '../../data/mock';

interface ClientDetailModalProps {
  client: ClientDetailed | null;
  onClose: () => void;
  onOpenNewDebt: () => void;
  onOpenPayment: (creance: Creance) => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  client,
  onClose,
  onOpenNewDebt,
  onOpenPayment,
}) => {
  if (!client) return null;

  const solde = soldeClient(client);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-xl p-5 shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
        {/* En-tête modal */}
        <div className="flex items-start justify-between pb-3 border-b border-gray-100 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-gray-900 text-lg">{client.nom}</h2>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  solde > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}
              >
                {solde > 0 ? `Dû : ${formatMontant(solde)}` : 'Solde nul (À jour)'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
              <span>{client.telephone}</span>
              <span>•</span>
              <span>{client.adresse}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={20} />
          </button>
        </div>

        {/* Bouton d'action rapide */}
        <div className="py-3 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Historique des dossiers de créances ({client.creances.length})
          </div>
          <button
            type="button"
            onClick={onOpenNewDebt}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-semibold text-xs hover:bg-blue-100 transition-colors"
          >
            <Plus size={14} />
            Nouvelle créance
          </button>
        </div>

        {/* Liste des créances scrollable */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3">
          {client.creances.length === 0 ? (
            <div className="text-center py-10 text-xs text-gray-400">
              Aucune créance enregistrée pour ce client.
            </div>
          ) : (
            client.creances.map((cr) => {
              const paye = cr.paiements.reduce((s, p) => s + p.montant, 0);
              const reste = Math.max(0, cr.montantTotal - paye);
              const isSolde = reste === 0;

              return (
                <div
                  key={cr.id}
                  className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/40 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-400" />
                      <span className="text-xs font-bold text-gray-800">
                        Dossier du {cr.date}
                      </span>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isSolde ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {isSolde ? 'Soldé' : `Reste ${formatMontant(reste)}`}
                    </span>
                  </div>

                  {/* Lignes d'articles */}
                  <div className="space-y-1 pl-2 border-l-2 border-gray-200">
                    {cr.lignes.map((l, i) => (
                      <div key={i} className="flex justify-between text-xs text-gray-600">
                        <span>
                          {l.nom} ({l.quantite} {l.unite})
                        </span>
                        <span className="font-medium text-gray-900">
                          {formatMontant(l.quantite * l.prixUnitaire)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Historique des paiements déjà versés */}
                  {cr.paiements.length > 0 && (
                    <div className="pt-2 border-t border-gray-200/60 space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-green-700">
                        Règlements reçus :
                      </div>
                      {cr.paiements.map((p) => (
                        <div key={p.id} className="flex justify-between text-[11px] text-gray-500">
                          <span>
                            {p.date} • {p.mode}
                          </span>
                          <span className="font-semibold text-green-600">
                            +{formatMontant(p.montant)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bouton de règlement si non soldé */}
                  {!isSolde && (
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => onOpenPayment(cr)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors shadow-xs"
                      >
                        <CreditCard size={13} />
                        Encaisser un versement
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100 flex justify-end flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailModal;
