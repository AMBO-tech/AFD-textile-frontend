import { useAuthStore } from '../../stores/useAuthStore';
import React, { useMemo } from 'react';
import DashboardKpiCards from './DashboardKpiCards';
import DashboardSalesChart from './DashboardSalesChart';
import DashboardTopProducts from './DashboardTopProducts';
import DashboardStockAlerts from './DashboardStockAlerts';
import DashboardQuickActions from './DashboardQuickActions';
import DashboardBoutiquesOverview from './DashboardBoutiquesOverview';
import { useLocationsListQuery } from '../../hooks/queries/useLocationsQuery';
import { useSalesListQuery } from '../../hooks/queries/useSalesQuery';
import { useCreancesTotalQuery, useDashboardKpisQuery } from '../../hooks/queries/useAnalyticsQuery';
import { useStockLevelsQuery } from '../../hooks/queries/useStocksQuery';

/** Plafond imposé par l'API sur les listes paginées. */
const API_PAGE_MAX = 100;

interface DashboardProps {
  role: string;
  onNavigate?: (s: string) => void;
  onVenteDirecte?: (produitId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ role: rawRole, onNavigate, onVenteDirecte }) => {
  const role = (rawRole === 'OWNER' || rawRole?.toLowerCase() === 'gerant') ? 'gerant' : 'boutiquier';
  const user = useAuthStore((s) => s.user);
  // Le serveur restreint déjà le boutiquier à sa boutique ; le gérant voit tout le réseau.
  const boutiqueId = role === 'boutiquier' ? user?.locationId ?? undefined : undefined;

  const { data: locRes } = useLocationsListQuery();
  const boutiques = (locRes?.data ?? []).filter((b) => b.type === 'BOUTIQUE');

  const { data: salesRes } = useSalesListQuery({ limit: API_PAGE_MAX, ...(boutiqueId ? { boutiqueId } : {}) });
  const ventes = salesRes?.data ?? [];

  const { data: stockRes } = useStockLevelsQuery({ limit: API_PAGE_MAX, ...(boutiqueId ? { locationId: boutiqueId } : {}) });
  const produits = stockRes?.data ?? [];

  const { data: kpisJour } = useDashboardKpisQuery('AUJOURDHUI', boutiqueId);
  const { data: kpisSemaine } = useDashboardKpisQuery('CETTE_SEMAINE', boutiqueId);
  const { data: creances } = useCreancesTotalQuery(boutiqueId);

  // Le serveur calcule estEnAlerte avec le seuil propre à chaque stock ; les plus bas d'abord.
  const alertesStock = useMemo(
    () => produits.filter((p) => p.estEnAlerte).sort((a, b) => a.quantite - b.quantite),
    [produits],
  );

  const stats = {
    ventesJour: kpisJour?.caFactureNet ?? 0,
    ventesSemaine: kpisSemaine?.caFactureNet ?? 0,
    nbVentes: kpisJour?.nombreVentes ?? 0,
    stockTotal: Math.round(produits.reduce((s, p) => s + p.quantite, 0) * 100) / 100,
    creancesTotal: creances?.totalCreancesGlobal ?? 0,
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-display font-bold text-gray-900 text-xl sm:text-2xl">
            {role === 'gerant' ? 'Tableau de bord Global' : 'Tableau de bord Caisse'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            {role === 'gerant'
              ? 'Aperçu consolidé des ventes, stocks et créances du réseau'
              : 'Gestion des ventes du jour et état du stock de votre boutique'}
          </p>
        </div>
        <span
          className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider hidden sm:inline-block"
          style={{
            background: role === 'gerant' ? '#EEF4FF' : '#F0FDF4',
            color: role === 'gerant' ? '#1E88E5' : '#16A34A',
          }}
        >
          {role === 'gerant' ? 'Mode Gérant' : 'Mode Boutiquier'}
        </span>
      </div>

      <DashboardKpiCards
        role={role}
        ventesJour={stats.ventesJour}
        ventesSemaine={stats.ventesSemaine}
        nbVentes={stats.nbVentes}
        stockTotal={stats.stockTotal}
        creancesTotal={stats.creancesTotal}
        alertesCount={alertesStock.length}
        onNavigate={onNavigate}
      />

      <DashboardQuickActions role={role} onNavigate={onNavigate} />

      <DashboardStockAlerts
        alerts={alertesStock}
        onNavigate={onNavigate}
        onVenteDirecte={onVenteDirecte}
      />

      {role === 'gerant' && (
        <DashboardBoutiquesOverview
          boutiques={boutiques}
          produits={produits}
          ventes={ventes}
          onNavigate={onNavigate}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DashboardSalesChart data={[]} />
        <DashboardTopProducts data={[]} />
      </div>
    </div>
  );
};

export default Dashboard;
