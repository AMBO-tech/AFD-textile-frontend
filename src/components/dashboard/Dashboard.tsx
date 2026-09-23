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
import { useClientsListQuery } from '../../hooks/queries/useClientsQuery';
import { useStockLevelsQuery } from '../../hooks/queries/useStocksQuery';

interface DashboardProps {
  role: string;
  onNavigate?: (s: string) => void;
  onVenteDirecte?: (produitId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ role: rawRole, onNavigate, onVenteDirecte }) => {
  const role = (rawRole === 'OWNER' || rawRole?.toLowerCase() === 'gerant') ? 'gerant' : 'boutiquier';
  const user = useAuthStore((s: any) => s.user);
  const locationId = user?.locationId || 'b1';
  
  const { data: locRes } = useLocationsListQuery();
  const boutiques = locRes?.data || [];
  
  const { data: salesRes } = useSalesListQuery({ limit: 100 });
  const ventes = salesRes?.data || [];
  
  const { data: clientRes } = useClientsListQuery();
  const clients = clientRes?.data || [];
  
  const { data: stockRes } = useStockLevelsQuery();
  const produits = stockRes?.data || [];

  // Produits et ventes ciblés selon le rôle
  const produitsAffiches = useMemo(() => {
    return role === 'gerant' ? produits : produits.filter((p: any) => p.locationId === locationId);
  }, [produits, role, locationId]);

  const alertesStock = useMemo(() => {
    return produitsAffiches.filter((p: any) => p.quantite <= p.seuilAlerte);
  }, [produitsAffiches]);

  const ventesValidees = useMemo(() => {
    return ventes.filter((v: any) => {
      const isValide = v.statut === 'VALIDE' || v.statut === 'validée';
      return role === 'gerant' ? isValide : isValide && v.locationId === locationId;
    });
  }, [ventes, role, locationId]);

  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const ventesJour = ventesValidees
      .filter((v: any) => v.date?.startsWith(todayStr) || v.createdAt?.startsWith(todayStr))
      .reduce((s: any, v: any) => s + (v.montant || v.montantTotal || 0), 0);

    const ventesSemaine = ventesValidees.reduce((s: any, v: any) => s + (v.montant || v.montantTotal || 0), 0);
    const stockTotal = produitsAffiches.reduce((s: any, p: any) => s + p.quantite, 0);
    const creancesTotal = clients.reduce((s: any, c: any) => {
      const solde = (c.creances || []).reduce((sc: any, cr: any) => {
        const paye = (cr.paiements || []).reduce((sp: any, p: any) => sp + p.montant, 0);
        return sc + Math.max(0, cr.montantTotal - paye);
      }, 0);
      return s + solde;
    }, 0);

    return {
      ventesJour,
      ventesSemaine,
      nbVentes: ventesValidees.length,
      stockTotal,
      creancesTotal,
    };
  }, [ventesValidees, produitsAffiches, clients]);

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
