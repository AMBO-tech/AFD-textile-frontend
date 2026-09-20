import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleProtectedRoute from './RoleProtectedRoute';
import AppLayout from '../layouts/AppLayout';
import { Spinner } from '../components/ui/spinner';

// Lazy loading des pages pour optimiser le bundle et la vitesse de chargement
const LoginPage = React.lazy(() => import('../pages/login/LoginPage').then(m => ({ default: m.LoginPage })));
const ActiverComptePage = React.lazy(() => import('../pages/auth/ActiverComptePage').then(m => ({ default: m.ActiverComptePage })));
const DashboardPage = React.lazy(() => import('../pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const StockPage = React.lazy(() => import('../pages/stock/StockPage').then(m => ({ default: m.StockPage })));
const SalesPage = React.lazy(() => import('../pages/sales/SalesPage').then(m => ({ default: m.SalesPage })));
const ClientsPage = React.lazy(() => import('../pages/clients/ClientsPage').then(m => ({ default: m.ClientsPage })));
const DemandesPage = React.lazy(() => import('../pages/demandes/DemandesPage').then(m => ({ default: m.DemandesPage })));
const ProductsPage = React.lazy(() => import('../pages/products/ProductsPage').then(m => ({ default: m.ProductsPage })));
const NotificationsPage = React.lazy(() => import('../pages/notifications/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const ParametresPage = React.lazy(() => import('../pages/parametres/ParametresPage').then(m => ({ default: m.ParametresPage })));
const EntrepotPage = React.lazy(() => import('../pages/entrepot/EntrepotPage').then(m => ({ default: m.EntrepotPage })));
const UsersPage = React.lazy(() => import('../pages/users/UsersPage').then(m => ({ default: m.UsersPage })));
const RapportsPage = React.lazy(() => import('../pages/rapports/RapportsPage').then(m => ({ default: m.RapportsPage })));
const HistoriquePage = React.lazy(() => import('../pages/historique/HistoriquePage').then(m => ({ default: m.HistoriquePage })));
const BoutiquesPage = React.lazy(() => import('../pages/boutiques/BoutiquesPage').then(m => ({ default: m.BoutiquesPage })));

const PageLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-slate-500 py-16">
    <Spinner className="w-8 h-8 text-indigo-600 animate-spin" />
    <span className="text-sm font-medium">Chargement du module...</span>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Routes publiques : Connexion et Activation de compte */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/activer-compte" element={<ActiverComptePage />} />

        {/* Routes protégées : Authentification requise */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/* Espace commun (Gérant & Boutiquier) */}
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/stock" element={<StockPage />} />
            <Route path="/ventes" element={<SalesPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/demandes" element={<DemandesPage />} />
            <Route path="/produits" element={<ProductsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/parametres" element={<ParametresPage />} />
            <Route path="/profil" element={<Navigate to="/parametres" replace />} />

            {/* Espace restreint : Gérant uniquement */}
            <Route element={<RoleProtectedRoute allowedRoles={['gerant']} />}>
              <Route path="/boutiques" element={<BoutiquesPage />} />
              <Route path="/entrepot" element={<EntrepotPage />} />
              <Route path="/utilisateurs" element={<UsersPage />} />
              <Route path="/rapports" element={<RapportsPage />} />
              <Route path="/historique" element={<HistoriquePage />} />
              <Route path="/sauvegardes" element={<Navigate to="/boutiques" replace />} />
              <Route path="/dashboard_admin" element={<DashboardPage />} />
            </Route>
          </Route>
        </Route>

        {/* Redirection fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
