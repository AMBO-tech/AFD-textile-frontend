import React from 'react';
import { HardDrive, RefreshCw, RotateCcw } from 'lucide-react';

interface SauvegardeActionsProps {
  loading: boolean;
  onManualBackup: () => void;
  onRestoreClick?: () => void;
}

export const SauvegardeActions: React.FC<SauvegardeActionsProps> = ({
  loading,
  onManualBackup,
  onRestoreClick,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={onManualBackup}
        disabled={loading}
        className="flex flex-col items-center gap-2 py-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-all disabled:opacity-60"
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: '#EBF5FB' }}
        >
          {loading ? (
            <RefreshCw size={18} color="#1E88E5" className="animate-spin" />
          ) : (
            <HardDrive size={18} color="#1E88E5" />
          )}
        </div>
        <span className="text-sm font-semibold text-gray-700">
          {loading ? 'En cours…' : 'Sauvegarde manuelle'}
        </span>
      </button>

      <button
        onClick={onRestoreClick}
        className="flex flex-col items-center gap-2 py-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-orange-200 transition-all"
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: '#FFFBEB' }}
        >
          <RotateCcw size={18} color="#F59E0B" />
        </div>
        <span className="text-sm font-semibold text-gray-700">Restauration</span>
      </button>
    </div>
  );
};

export default SauvegardeActions;
