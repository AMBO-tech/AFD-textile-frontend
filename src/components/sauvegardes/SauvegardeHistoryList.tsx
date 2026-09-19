import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import type { Sauvegarde } from './types';

interface SauvegardeHistoryListProps {
  sauvegardes: Sauvegarde[];
  onRestoreItem?: (id: string) => void;
}

export const SauvegardeHistoryList: React.FC<SauvegardeHistoryListProps> = ({
  sauvegardes,
  onRestoreItem,
}) => {
  return (
    <div className="space-y-2">
      <h3 className="font-display font-semibold text-gray-700 text-sm">Historique</h3>
      {sauvegardes.map((s) => (
        <div
          key={s.id}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: s.statut === 'succès' ? '#F0FDF4' : '#FEF2F2' }}
          >
            {s.statut === 'succès' ? (
              <CheckCircle size={16} color="#22C55E" />
            ) : (
              <XCircle size={16} color="#EF4444" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-gray-800 capitalize">
                {s.type}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  s.statut === 'succès'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                {s.statut}
              </span>
            </div>
            <div className="text-xs text-gray-400">
              {s.date} · {s.taille}
            </div>
          </div>
          {s.statut === 'succès' && (
            <button
              onClick={() => onRestoreItem?.(s.id)}
              className="text-xs text-blue-500 font-medium hover:text-blue-700 transition-colors flex-shrink-0"
            >
              Restaurer
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default SauvegardeHistoryList;
