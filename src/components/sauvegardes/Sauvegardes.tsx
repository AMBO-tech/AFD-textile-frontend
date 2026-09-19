import React, { useState } from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import { useMockStore } from '../../data/useMockStore';
import SauvegardeActions from './SauvegardeActions';
import SauvegardeHistoryList from './SauvegardeHistoryList';

export const Sauvegardes: React.FC = () => {
  const { sauvegardes, triggerSauvegarde } = useMockStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleManual = () => {
    setLoading(true);
    setTimeout(() => {
      triggerSauvegarde('manuelle');
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-gray-900">Sauvegardes</h1>
          <p className="text-sm text-gray-500">
            {sauvegardes.length} sauvegardes · automatique quotidienne
          </p>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3">
          <CheckCircle size={16} color="#22C55E" />
          <span className="text-green-700 text-sm font-medium">
            Sauvegarde manuelle effectuée avec succès
          </span>
        </div>
      )}

      {/* Actions */}
      <SauvegardeActions
        loading={loading}
        onManualBackup={handleManual}
      />

      {/* Auto backup info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3">
        <Clock size={16} color="#1E88E5" />
        <div className="text-sm">
          <span className="font-medium text-blue-800">Sauvegarde automatique activée</span>
          <span className="text-blue-600 block text-xs">Chaque jour à 00:00 · Cloud sécurisé</span>
        </div>
      </div>

      {/* History */}
      <SauvegardeHistoryList sauvegardes={sauvegardes} />
    </div>
  );
};

export default Sauvegardes;
