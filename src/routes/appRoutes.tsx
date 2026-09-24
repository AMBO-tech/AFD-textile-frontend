import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleProtectedRoute from './RoleProtectedRoute';
import AppLayout from '../layouts/AppLayout';
import {
  LoginPage,
  DashboardPage,
  StockPage,
  SalesPage,
  ClientsPage,
  DemandesPage,
  ProductsPage,
  NotificationsPage,
  ParametresPage,
  EntrepotPage,
  UsersPage,
  RapportsPage,
  HistoriquePage,
  ActiverComptePage,
} from '../pages';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Route publique : Connexion */}
      <Route path="/login" element={<LoginPage />} />
      {/* Route publique : activation d'un compte invité (lien reçu par SMS / e-mail) */}
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
            <Route path="/entrepot" element={<EntrepotPage />} />
            <Route path="/utilisateurs" element={<UsersPage />} />
            <Route path="/rapports" element={<RapportsPage />} />
            <Route path="/historique" element={<HistoriquePage />} />

            <Route path="/dashboard_admin" element={<DashboardPage />} />
          </Route>
        </Route>
      </Route>

      {/* Redirection fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
