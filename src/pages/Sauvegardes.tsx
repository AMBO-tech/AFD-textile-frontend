import { useState } from 'react';
import { HardDrive, RefreshCw, RotateCcw, CheckCircle, XCircle, Clock, ShieldCheck } from 'lucide-react';

interface Sauvegarde {
  id: string;
  type: 'automatique' | 'manuelle';
  taille: string;
  date: string;
  statut: 'succès' | 'erreur';
}

const INITIAL_BACKUPS: Sauvegarde[] = [
  { id: 's1', type: 'automatique', taille: '14.2 Mo', date: '2026-09-20 00:00', statut: 'succès' },
  { id: 's2', type: 'manuelle', taille: '14.1 Mo', date: '2026-09-19 18:35', statut: 'succès' },
  { id: 's3', type: 'automatique', taille: '13.9 Mo', date: '2026-09-19 00:00', statut: 'succès' },
  { id: 's4', type: 'automatique', taille: '13.5 Mo', date: '2026-09-18 00:00', statut: 'succès' },
];

export default function Sauvegardes() {
  const [sauvegardes, setSauvegardes] = useState<Sauvegarde[]>(INITIAL_BACKUPS);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleManual = () => {
    setLoading(true);
    setTimeout(() => {
      const dateStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
      const ns: Sauvegarde = {
        id: 's' + Date.now(),
        type: 'manuelle',
        taille: '14.3 Mo',
        date: dateStr,
        statut: 'succès',
      };
      setSauvegardes(ss => [ns, ...ss]);
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0F3D5E]">Sauvegardes & Restauration</h1>
          <p className="text-sm text-gray-500 mt-1">
            {sauvegardes.length} instantanés archivés · Synchronisation automatique quotidienne
          </p>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl p-4 shadow-sm animate-in fade-in duration-200">
          <CheckCircle size={18} color="#22C55E" className="flex-shrink-0" />
          <span className="text-green-800 text-sm font-semibold">
            Nouvelle sauvegarde manuelle générée et cryptée avec succès sur le Cloud AFD.
          </span>
        </div>
      )}

      {/* Cartes d'actions rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={handleManual}
          disabled={loading}
          className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all disabled:opacity-60 text-center cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: '#EBF5FB' }}>
            {loading ? (
              <RefreshCw size={22} color="#1E88E5" className="animate-spin" />
            ) : (
              <HardDrive size={22} color="#1E88E5" />
            )}
          </div>
          <div>
            <span className="text-sm font-bold text-gray-800 block">
              {loading ? 'Création de l\'archive...' : 'Sauvegarde manuelle'}
            </span>
            <span className="text-xs text-gray-400 mt-0.5 block">Snapshot instantané de la base locale</span>
          </div>
        </button>

        <button
          onClick={() => alert('Sélectionnez une sauvegarde dans l\'historique pour restaurer')}
          className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-orange-300 hover:shadow-md transition-all text-center cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: '#FFFBEB' }}>
            <RotateCcw size={22} color="#F59E0B" />
          </div>
          <div>
            <span className="text-sm font-bold text-gray-800 block">Restauration Système</span>
            <span className="text-xs text-gray-400 mt-0.5 block">Restaurer un point de contrôle antérieur</span>
          </div>
        </button>
      </div>

      {/* Info backup auto */}
      <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-4 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-blue-100/70 flex items-center justify-center flex-shrink-0">
          <Clock size={18} color="#1E88E5" />
        </div>
        <div className="text-sm">
          <span className="font-bold text-blue-900 block">Sauvegarde automatique cloud active</span>
          <span className="text-blue-700 text-xs">Exécution programmée chaque nuit à 00:00 · Chiffrement AES-256</span>
        </div>
      </div>

      {/* Historique des sauvegardes */}
      <div className="space-y-3">
        <h3 className="font-display font-bold text-gray-800 text-base">Historique des archives</h3>
        <div className="space-y-2.5">
          {sauvegardes.map(s => (
            <div
              key={s.id}
              className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 flex items-center justify-between gap-3 hover:shadow-sm"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: s.statut === 'succès' ? '#F0FDF4' : '#FEF2F2' }}
                >
                  {s.statut === 'succès' ? <CheckCircle size={18} color="#22C55E" /> : <XCircle size={18} color="#EF4444" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900 capitalize">{s.type}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        s.statut === 'succès' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {s.statut}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.date} · Taille: {s.taille}</div>
                </div>
              </div>
              {s.statut === 'succès' && (
                <button
                  onClick={() => confirm(`Confirmer la restauration de la sauvegarde du ${s.date} ?`) && alert('Restauration initiée.')}
                  className="text-xs text-blue-600 font-bold hover:text-blue-800 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-50 transition-colors flex-shrink-0"
                >
                  Restaurer
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
