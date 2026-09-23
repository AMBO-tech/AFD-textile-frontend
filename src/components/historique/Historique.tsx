import React, { useState, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';

import type { HistoryItem } from './types';
import { ACTION_CONFIG } from './types';
import HistoriqueStatsCards from './HistoriqueStatsCards';
import HistoriqueFilters, { type EmplacementFilterItem } from './HistoriqueFilters';
import HistoriqueTimeline from './HistoriqueTimeline';

interface HistoriqueProps {
  role?: 'gerant' | 'boutiquier';
  boutiqueId?: string;
}

export const Historique: React.FC<HistoriqueProps> = ({
  role = 'gerant',
  boutiqueId = 'b1',
}) => {
  const historique: any[] = [];
  const boutiques: any[] = [];

  const [filtreBoutique, setFiltreBoutique] = useState<string>(
    role === 'gerant' ? 'tous' : boutiqueId
  );
  const [filtreAction, setFiltreAction] = useState<string>('toutes');
  const [search, setSearch] = useState('');

  // Emplacements disponibles
  const emplacements: EmplacementFilterItem[] = useMemo(() => [
    { id: 'tous', nom: 'Toutes les boutiques', lieu: 'RÃ©seau global AFD', type: 'global' },
    { id: 'entrepot', nom: 'EntrepÃ´t Central', lieu: 'Dakar - Zone Industrielle', type: 'entrepot' },
    ...boutiques.map((b: any) => ({ ...b, type: 'boutique' as const })),
  ], [boutiques]);

  // DÃ©terminer la catÃ©gorie d'action d'un Ã©lÃ©ment
  const getActionCategory = (item: HistoryItem): string => {
    const rawItem = item as unknown as Record<string, unknown>;
    if (typeof rawItem.typeAction === 'string') return rawItem.typeAction;
    const act = item.action.toLowerCase();
    if (act.includes('vente')) return 'vente';
    if (act.includes('stock') || act.includes('rÃ©ception')) return 'stock';
    if (act.includes('transfert')) return 'transfert';
    if (act.includes('crÃ©ance') || act.includes('paiement') || act.includes('rÃ¨glement')) return 'creance';
    if (act.includes('ajout') || act.includes('modif')) return 'catalogue';
    if (act.includes('annul')) return 'annulation';
    if (act.includes('connex')) return 'connexion';
    return 'vente';
  };

  // Liste filtrÃ©e
  const itemsFiltres = useMemo(() => {
    return historique.filter((item: any) => {
      const matchBoutique = filtreBoutique === 'tous' || item.boutique === filtreBoutique;
      const catAction = getActionCategory(item);
      const matchAction = filtreAction === 'toutes' || catAction === filtreAction;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        item.details.toLowerCase().includes(q) ||
        item.utilisateur.toLowerCase().includes(q) ||
        item.action.toLowerCase().includes(q) ||
        item.date.includes(q);

      return matchBoutique && matchAction && matchSearch;
    });
  }, [historique, filtreBoutique, filtreAction, search]);

  // Compteurs par action pour la boutique sÃ©lectionnÃ©e
  const actionCounts = useMemo(() => {
    const itemsInBoutique = historique.filter(
      (item: any) => filtreBoutique === 'tous' || item.boutique === filtreBoutique
    );
    const counts: Record<string, number> = {
      toutes: itemsInBoutique.length,
      vente: 0,
      stock: 0,
      transfert: 0,
      creance: 0,
      catalogue: 0,
      annulation: 0,
      connexion: 0,
    };
    itemsInBoutique.forEach((item: any) => {
      const cat = getActionCategory(item);
      if (counts[cat] !== undefined) {
        counts[cat] += 1;
      }
    });
    return counts;
  }, [historique, filtreBoutique]);

  // Compteurs par boutique
  const boutiqueCounts = useMemo(() => {
    const counts: Record<string, number> = { tous: historique.length };
    emplacements.forEach((emp) => {
      if (emp.id !== 'tous') {
        counts[emp.id] = historique.filter((h: any) => h.boutique === emp.id).length;
      }
    });
    return counts;
  }, [historique, emplacements]);

  // Groupement par date pour l'affichage chronologique
  const groupesParDate = useMemo(() => {
    const groupes: Record<string, HistoryItem[]> = {};
    itemsFiltres.forEach((item: any) => {
      const d = item.date.split(' ')[0];
      if (!groupes[d]) groupes[d] = [];
      groupes[d].push(item);
    });
    return groupes;
  }, [itemsFiltres]);

  const formatDateLabel = (dateStr: string) => {
    const today = '2026-09-13';
    const yesterday = '2026-09-12';
    if (dateStr === today) return "Aujourd'hui Â· 13 Septembre 2026";
    if (dateStr === yesterday) return 'Hier Â· 12 Septembre 2026';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const resetFilters = () => {
    setFiltreBoutique(role === 'gerant' ? 'tous' : boutiqueId);
    setFiltreAction('toutes');
    setSearch('');
  };

  const hasActiveFilters =
    filtreBoutique !== (role === 'gerant' ? 'tous' : boutiqueId) ||
    filtreAction !== 'toutes' ||
    search.trim() !== '';

  const filtreBoutiqueNom =
    filtreBoutique !== 'tous'
      ? emplacements.find((e) => e.id === filtreBoutique)?.nom || ''
      : 'Toutes boutiques';

  const filtreActionLabel =
    ACTION_CONFIG[filtreAction]?.label || filtreAction;

  return (
    <div className="space-y-4">
      {/* â”€â”€ En-tÃªte Principal â”€â”€ */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-bold text-gray-900">Journal d'ActivitÃ©</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              {itemsFiltres.length} Ã©vÃ©nement{itemsFiltres.length !== 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            TraÃ§abilitÃ© complÃ¨te des opÃ©rations, ventes, mouvements et accÃ¨s
          </p>
        </div>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 shadow-xs transition-all active:scale-95"
          >
            <RefreshCw size={12} />
            <span>RÃ©initialiser</span>
          </button>
        )}
      </div>

      {/* â”€â”€ Cartes SynthÃ©tiques Rapides â”€â”€ */}
      <HistoriqueStatsCards actionCounts={actionCounts} />

      {/* â”€â”€ Recherche & Filtres â”€â”€ */}
      <HistoriqueFilters
        role={role}
        search={search}
        onSearchChange={setSearch}
        filtreBoutique={filtreBoutique}
        onFiltreBoutiqueChange={setFiltreBoutique}
        filtreAction={filtreAction}
        onFiltreActionChange={setFiltreAction}
        emplacements={emplacements}
        boutiqueCounts={boutiqueCounts}
        actionCounts={actionCounts}
      />

      {/* â”€â”€ Timeline des Ã‰vÃ©nements â”€â”€ */}
      <HistoriqueTimeline
        groupesParDate={groupesParDate}
        boutiques={boutiques}
        getActionCategory={getActionCategory}
        formatDateLabel={formatDateLabel}
        onResetFilters={resetFilters}
        filtreBoutiqueNom={filtreBoutiqueNom}
        filtreActionLabel={filtreActionLabel}
      />
    </div>
  );
};

export default Historique;
