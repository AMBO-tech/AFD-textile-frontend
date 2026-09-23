import React from 'react';
import { ArrowLeftRight, CheckCircle2, Clock } from 'lucide-react';


interface EntrepotTransferHistoryProps {
  historique: HistoriqueItem[];
}

export const EntrepotTransferHistory: React.FC<EntrepotTransferHistoryProps> = ({ historique }) => {
  const transferts = historique.filter((h) => h.typeAction === 'transfert');

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="font-display font-bold text-gray-900 text-sm sm:text-base">
          Historique des Mouvements & Transferts ({transferts.length})
        </div>
      </div>

      <div className="divide-y divide-gray-50 overflow-x-auto">
        {transferts.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-400">
            Aucun transfert consigné dans le journal.
          </div>
        ) : (
          transferts.map((item) => (
            <div
              key={item.id}
              className="p-3.5 flex items-center justify-between gap-3 hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <ArrowLeftRight size={18} />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 text-xs truncate">
                    {item.details}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    Par <span className="font-medium text-gray-700">{item.utilisateur}</span> • {item.date}
                  </div>
                </div>
              </div>

              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 flex items-center gap-1">
                <CheckCircle2 size={12} />
                Effectué
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EntrepotTransferHistory;
