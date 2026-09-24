import { formatMontant } from '../../../utils/format';
import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Package,
  TrendingUp,
  CreditCard,
  Calendar,
  Plus,
} from 'lucide-react';
import type { ClientDetailed, Creance } from '../../../types/clients';

interface ClientCreancesListProps {
  client: ClientDetailed;
  formatMontant: (n: number) => string;
  onOpenNewDebt: () => void;
  onOpenPayment: (creance: Creance) => void;
}

const getModeBadgeStyle = (mode: string) => {
  switch (mode.toLowerCase()) {
    case 'wave':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'orange money':
    case 'om':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'free money':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'carte bancaire':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'espèces':
    case 'especes':
    default:
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
};

export const ClientCreancesList: React.FC<ClientCreancesListProps> = ({
  client,
  formatMontant,
  onOpenNewDebt,
  onOpenPayment,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
          <Clock size={14} className="text-gray-400" />
          <span>Dossiers de vente à crédit ({client.creances.length})</span>
        </h3>
      </div>

      {client.creances.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-gray-200 rounded-2xl bg-gray-50/60">
          <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-2" />
          <p className="text-sm font-bold text-gray-800">Aucun dossier de dette en cours</p>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Ce client n'a aucun historique d'impayé. Vous pouvez lui créer une commande en gros ou vente à crédit à tout moment.
          </p>
          <button
            type="button"
            onClick={onOpenNewDebt}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-sm hover:shadow transition-all cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
          >
            <Plus size={14} />
            <span>Créer une vente à crédit</span>
          </button>
        </div>
      ) : (
        client.creances.map((cr) => {
          const paye = cr.paiements.reduce((s, p) => s + p.montant, 0);
          const reste = Math.max(0, cr.montantTotal - paye);
          const isSolde = reste === 0;
          const dossierPct =
            cr.montantTotal > 0
              ? Math.min(100, Math.round((paye / cr.montantTotal) * 100))
              : 100;

          return (
            <div
              key={cr.id}
              className={`rounded-2xl border transition-all p-4 space-y-3.5 bg-white ${
                isSolde
                  ? 'border-gray-100 shadow-xs'
                  : 'border-rose-100 shadow-xs hover:border-rose-200'
              }`}
            >
              {/* Entête du dossier */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isSolde ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    <Calendar size={14} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900">
                      Commande du {cr.date}
                    </span>
                    <span className="text-[10px] text-gray-400 ml-2 font-mono">
                      ID: {cr.id.replace('cr_init_', '').replace('cr_', '#')}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                    isSolde
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {isSolde ? (
                    <>
                      <CheckCircle2 size={12} />
                      <span>Soldé</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={12} />
                      <span>Reste {formatMontant(reste)}</span>
                    </>
                  )}
                </span>
              </div>

              {/* Barre de règlement du dossier */}
              <div>
                <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                  <span>
                    Total : <strong className="text-gray-800">{formatMontant(cr.montantTotal)}</strong>
                  </span>
                  <span>
                    Versé : <strong className="text-emerald-700">{formatMontant(paye)}</strong> ({dossierPct}%)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isSolde ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${dossierPct}%` }}
                  />
                </div>
              </div>

              {/* Liste des articles du dossier */}
              <div className="space-y-1.5 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                  <Package size={11} />
                  <span>Articles achetés :</span>
                </div>
                <div className="space-y-1 divide-y divide-gray-100">
                  {cr.lignes.map((l, i) => (
                    <div key={i} className="pt-1 first:pt-0 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <span className="font-medium text-gray-900">{l.nom}</span>
                        <span className="text-gray-400 text-[11px]">
                          ({l.quantite} {l.unite})
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-gray-900">
                          {formatMontant(l.quantite * l.prixUnitaire)}
                        </span>
                        {l.quantite > 1 && (
                          <span className="text-[10px] text-gray-400 block">
                            à {formatMontant(l.prixUnitaire)} / {l.unite}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Historique des paiements déjà versés */}
              {cr.paiements.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                    <TrendingUp size={11} />
                    <span>Règlements reçus ({cr.paiements.length}) :</span>
                  </div>
                  <div className="space-y-1">
                    {cr.paiements.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-gray-600"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getModeBadgeStyle(
                              p.mode
                            )}`}
                          >
                            {p.mode}
                          </span>
                          <span className="text-gray-400 text-[11px]">{p.date}</span>
                        </div>
                        <span className="font-bold text-emerald-600">
                          +{formatMontant(p.montant)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action de règlement si non soldé */}
              {!isSolde && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onOpenPayment(cr)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs active:scale-95 cursor-pointer"
                  >
                    <CreditCard size={13} />
                    <span>Encaisser un versement</span>
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default ClientCreancesList;
