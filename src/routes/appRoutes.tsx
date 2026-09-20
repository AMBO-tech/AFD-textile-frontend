import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleProtectedRoute from './RoleProtectedRoute';
import AppLayout from '../layouts/AppLayout';
import { Spinner } from '../components/ui/spinner';

// Lazy loading des pages réorganisées et optimisées
const LoginPage = React.lazy(() => import('../pages/login/LoginPage').then(m => ({ default: m.LoginPage })));
const ActiverComptePage = React.lazy(() => import('../pages/auth/ActiverComptePage').then(m => ({ default: m.ActiverComptePage })));

// Pages réorganisées v2.0 (Architecture Hubs & Rayons unifiés)
const DashboardReorganizedPage = React.lazy(() => import('../pages/dashboard/DashboardReorganizedPage'));
const CaissePosPage = React.lazy(() => import('../pages/caisse/CaissePosPage'));
const InventaireHubPage = React.lazy(() => import('../pages/inventaire/InventaireHubPage'));
const RecouvrementPage = React.lazy(() => import('../pages/recouvrement/RecouvrementPage'));

// Pages opérationnelles existantes
const DemandesPage = React.lazy(() => import('../pages/demandes/DemandesPage').then(m => ({ default: m.DemandesPage })));
const NotificationsPage = React.lazy(() => import('../pages/notifications/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const ParametresPage = React.lazy(() => import('../pages/parametres/ParametresPage').then(m => ({ default: m.ParametresPage })));
const BoutiquesPage = React.lazy(() => import('../pages/boutiques/BoutiquesPage').then(m => ({ default: m.BoutiquesPage })));
const UsersPage = React.lazy(() => import('../pages/users/UsersPage').then(m => ({ default: m.UsersPage })));
const RapportsPage = React.lazy(() => import('../pages/rapports/RapportsPage').then(m => ({ default: m.RapportsPage })));
const HistoriquePage = React.lazy(() => import('../pages/historique/HistoriquePage').then(m => ({ default: m.HistoriquePage })));

const PageLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-slate-500 py-16">
    <Spinner className="w-8 h-8 text-[#1E88E5] animate-spin" />
    <span className="text-sm font-medium">Chargement du module AFD Textile...</span>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/activer-compte" element={<ActiverComptePage />} />

        {/* Routes protégées */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/* 1. Cockpit Exécutif (Accueil réorganisé) */}
            <Route path="/" element={<DashboardReorganizedPage />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />

            {/* 2. Caisse & Ventes (Terminal POS réorganisé) */}
            <Route path="/caisse" element={<CaissePosPage />} />
            <Route path="/ventes" element={<CaissePosPage />} />

            {/* 3. Hub Inventaire (Stock boutique, Entrepôt & Catalogue unifiés) */}
            <Route path="/inventaire" element={<InventaireHubPage />} />
            <Route path="/stock" element={<InventaireHubPage />} />
            <Route path="/produits" element={<InventaireHubPage />} />
            <Route path="/entrepot" element={<InventaireHubPage />} />

            {/* 4. CRM & Recouvrement (Créances & Relances multicanal) */}
            <Route path="/recouvrement" element={<RecouvrementPage />} />
            <Route path="/clients" element={<RecouvrementPage />} />

            {/* 5. Demandes & Approbations Inter-Boutiques */}
            <Route path="/demandes" element={<DemandesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/parametres" element={<ParametresPage />} />
            <Route path="/profil" element={<Navigate to="/parametres" replace />} />

            {/* 6. Espace réservé Gérant */}
            <Route element={<RoleProtectedRoute allowedRoles={['gerant']} />}>
              <Route path="/boutiques" element={<BoutiquesPage />} />
              <Route path="/utilisateurs" element={<UsersPage />} />
              <Route path="/rapports" element={<RapportsPage />} />
              <Route path="/historique" element={<HistoriquePage />} />
              <Route path="/sauvegardes" element={<Navigate to="/boutiques" replace />} />
              <Route path="/dashboard_admin" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
