import { formatMontant } from '@/utils/format';
import React from 'react';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import type { Vente } from '../../types/sales';

interface SalesHistoryTableProps {
  ventes: Vente[];
  onCancelClick: (vente: Vente) => void;
}

const resumeArticles = (v: Vente) =>
  v.lignes.map((l) => `${l.produitNom} (${l.quantite} ${l.uniteSaisie.toLowerCase()})`).join(', ');

const formatDateHeure = (iso: string) =>
  new Date(iso).toLocaleString('fr-SN', { dateStyle: 'short', timeStyle: 'short' });

export const SalesHistoryTable: React.FC<SalesHistoryTableProps> = ({
  ventes,
  onCancelClick,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="font-display font-bold text-gray-900 text-sm sm:text-base">
          Dernières Ventes Enregistrées ({ventes.length})
        </div>
      </div>

      <div className="divide-y divide-gray-50 overflow-x-auto">
        {ventes.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-400">
            Aucune vente enregistrée pour le moment.
          </div>
        ) : (
          ventes.map((v) => {
            const isAnnulee = v.statut === 'ANNULEE';

            return (
              <div
                key={v.id}
                className="p-3.5 flex items-center justify-between gap-3 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isAnnulee ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'
                    }`}
                  >
                    {isAnnulee ? <XCircle size={18} /> : <CheckCircle size={18} />}
                  </div>

                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 text-xs truncate">
                      {v.referenceFacture} · {resumeArticles(v)}
                      {isAnnulee && (
                        <span className="text-[10px] font-bold ml-2 text-red-500 uppercase">
                          (Annulée)
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      Client : <span className="font-medium text-gray-700">{v.clientNom || 'Passage'}</span> •{' '}
                      {formatDateHeure(v.createdAt)}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      Vendeur : {v.vendeurNom}
                      {v.soldeDu > 0 && !isAnnulee && (
                        <span className="text-amber-600 font-semibold"> • Reste dû : {formatMontant(v.soldeDu)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div
                      className={`font-display font-bold text-xs sm:text-sm ${
                        isAnnulee ? 'text-gray-400 line-through' : 'text-gray-900'
                      }`}
                    >
                      {formatMontant(v.montantTotal)}
                    </div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                      {v.statutPaiement.replace('_', ' ')}
                    </span>
                  </div>

                  {!isAnnulee && (
                    <button
                      type="button"
                      onClick={() => onCancelClick(v)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Annuler cette vente"
                    >
                      <RotateCcw size={15} />
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

export default SalesHistoryTable;
