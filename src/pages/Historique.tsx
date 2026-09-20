import { useState } from 'react';
import { History, Filter, Search, Calendar } from 'lucide-react';
import { useLocationStore } from '../stores/locationStore';

interface Operation {
  id: string;
  action: 'Vente' | 'Connexion' | 'Transfert' | 'Annulation' | 'Ajout produit' | 'Modification';
  details: string;
  utilisateur: string;
  boutique: string;
  date: string;
}

const ACTION_COLORS: Record<string, { color: string; bg: string }> = {
  Vente: { color: '#22C55E', bg: '#F0FDF4' },
  Connexion: { color: '#1E88E5', bg: '#EBF5FB' },
  Transfert: { color: '#F59E0B', bg: '#FFFBEB' },
  Annulation: { color: '#EF4444', bg: '#FEF2F2' },
  'Ajout produit': { color: '#0F3D5E', bg: '#EBF0F5' },
  Modification: { color: '#6B7280', bg: '#F9FAFB' },
};

const INITIAL_HISTORIQUE: Operation[] = [
  { id: 'h1', action: 'Vente', details: 'Vente de 6 yards Wax Hollandais (72 000 F CFA - Wave)', utilisateur: 'Ibrahim Koné', boutique: 'Boutique Plateau', date: 'Aujourd\'hui à 11:42' },
  { id: 'h2', action: 'Transfert', details: 'Demande de transfert de 15 rouleaux Bazin Riche vers Boutique Cocody', utilisateur: 'Amadou Diallo', boutique: 'Entrepôt Central', date: 'Aujourd\'hui à 10:15' },
  { id: 'h3', action: 'Ajout produit', details: 'Ajout référence "Ankara Golden Luxury" - 50 unités en stock', utilisateur: 'Amadou Diallo', boutique: 'Entrepôt Central', date: 'Hier à 16:20' },
  { id: 'h4', action: 'Vente', details: 'Vente de 3 yards Soie Sauvage (45 000 F CFA - Espèces)', utilisateur: 'Ibrahim Koné', boutique: 'Boutique Plateau', date: 'Hier à 14:05' },
  { id: 'h5', action: 'Annulation', details: 'Annulation ticket vente #TK-9821 (Erreur saisie métrage)', utilisateur: 'Ibrahim Koné', boutique: 'Boutique Plateau', date: 'Hier à 12:30' },
  { id: 'h6', action: 'Connexion', details: 'Connexion session gérant réussie', utilisateur: 'Amadou Diallo', boutique: 'Boutique Plateau', date: 'Hier à 08:30' },
];

export default function Historique() {
  const { currentStore } = useLocationStore();
  const [filterAction, setFilterAction] = useState('');
  const [search, setSearch] = useState('');

  const actions = ['Vente', 'Connexion', 'Transfert', 'Annulation', 'Ajout produit', 'Modification'];

  const filtered = INITIAL_HISTORIQUE.filter(h => {
    const matchAction = !filterAction || h.action === filterAction;
    const matchSearch = !search || h.details.toLowerCase().includes(search.toLowerCase()) || h.utilisateur.toLowerCase().includes(search.toLowerCase());
    return matchAction && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0F3D5E]">Journal d'Activité & Historique</h1>
          <p className="text-sm text-gray-500 mt-1">
            Traçabilité complète des opérations, ventes et mouvements logistiques
          </p>
        </div>
      </div>

      {/* Barre de filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une opération, utilisateur..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 shadow-sm"
          />
        </div>
        <select
          value={filterAction}
          onChange={e => setFilterAction(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400/30 shadow-sm min-w-[180px]"
        >
          <option value="">Toutes les actions</option>
          {actions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Timeline d'activités */}
      <div className="space-y-3">
        {filtered.map(h => {
          const cfg = ACTION_COLORS[h.action] ?? { color: '#6B7280', bg: '#F9FAFB' };
          return (
            <div
              key={h.id}
              className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold shadow-sm"
                style={{ background: cfg.bg, color: cfg.color }}
              >
                {h.action[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                    style={{ background: cfg.bg, color: cfg.color }}
                  >
                    {h.action}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">· {h.date}</span>
                </div>
                <p className="text-sm font-medium text-gray-800 mt-1.5 leading-snug">{h.details}</p>
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                  <span className="font-semibold text-gray-600">{h.utilisateur}</span>
                  <span>·</span>
                  <span className="text-gray-400">{h.boutique}</span>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <p className="text-gray-500 text-sm">Aucune opération trouvée pour ce filtre.</p>
          </div>
        )}
      </div>
    </div>
  );
}
