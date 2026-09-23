import { useAuthStore } from '../../stores/useAuthStore';
import React, { useMemo } from 'react';
import DashboardKpiCards from './DashboardKpiCards';
import DashboardSalesChart from './DashboardSalesChart';
import DashboardTopProducts from './DashboardTopProducts';
import DashboardStockAlerts from './DashboardStockAlerts';
import DashboardQuickActions from './DashboardQuickActions';
import DashboardBoutiquesOverview from './DashboardBoutiquesOverview';

interface DashboardProps {
  role: 'gerant' | 'boutiquier';
  onNavigate?: (s: string) => void;
  onVenteDirecte?: (produitId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ role, onNavigate, onVenteDirecte }) => {
  const produits: any = [];
const ventes: any = [];
const clients: any = [];
const boutiques: any = [];
const user = useAuthStore((s: any) => s.user); const session = user;
  const boutiqueId = session?.boutiqueId || 'b1';

  // Produits et ventes ciblés selon le rôle
  const produitsAffiches = useMemo(() => {
    return role === 'gerant' ? produits : produits.filter((p: any) => p.boutique === boutiqueId);
  }, [produits, role, boutiqueId]);

  const alertesStock = useMemo(() => {
    return produitsAffiches.filter((p: any) => p.quantite <= p.seuil);
  }, [produitsAffiches]);

  const ventesValidees = useMemo(() => {
    return ventes.filter((v: any) => {
      const isValide = v.statut === 'validée';
      return role === 'gerant' ? isValide : isValide && v.boutique === boutiqueId;
    });
  }, [ventes, role, boutiqueId]);

  const stats = useMemo(() => {
    const todayStr = '2026-09-13';
    const ventesJour = ventesValidees
      .filter((v: any) => v.date === todayStr || v.date === new Date().toISOString().split('T')[0])
      .reduce((s: any, v: any) => s + v.montant, 0);

    const ventesSemaine = VENTES_SEMAINE.reduce((s: any, v: any) => s + v.montant, 0);
    const stockTotal = produitsAffiches.reduce((s: any, p: any) => s + p.quantite, 0);
    const creancesTotal = clients.reduce((s: any, c: any) => {
      const solde = c.creances.reduce((sc: any, cr: any) => {
        const paye = cr.paiements.reduce((sp: any, p: any) => sp + p.montant, 0);
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
      {/* En-tête de bienvenue contextuelle */}
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

      {/* Cartes KPI */}
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

      {/* Actions rapides */}
      <DashboardQuickActions role={role} onNavigate={onNavigate} />

      {/* Alertes de stock critique */}
      <DashboardStockAlerts
        alerts={alertesStock}
        onNavigate={onNavigate}
        onVenteDirecte={onVenteDirecte}
      />

      {/* Vue comparative multi-boutiques réservée au Gérant */}
      {role === 'gerant' && (
        <DashboardBoutiquesOverview
          boutiques={boutiques}
          produits={produits}
          ventes={ventes}
          onNavigate={onNavigate}
        />
      )}

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DashboardSalesChart data={VENTES_SEMAINE} />
        <DashboardTopProducts data={TOP_PRODUITS} />
      </div>
    </div>
  );
};

export default Dashboard;
