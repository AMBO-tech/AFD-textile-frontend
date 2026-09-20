import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { AppLayout } from './components/layout/AppLayout'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Ventes from './pages/Ventes'
import Inventaire from './pages/Inventaire'
import Clients from './pages/Clients'
import Entrepot from './pages/Entrepot'
import Demandes from './pages/Demandes'
import Utilisateurs from './pages/Utilisateurs'
import Rapports from './pages/Rapports'
import Historique from './pages/Historique'
import Parametres from './pages/Parametres'
import Profil from './pages/Profil'
import Notifications from './pages/Notifications'
import Sauvegardes from './pages/Sauvegardes'

// ProtectedRoute guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      {/* Route publique */}
      <Route path="/login" element={<Login />} />

      {/* Routes protégées */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Ventes / Sales */}
        <Route path="ventes" element={<Ventes />} />
        <Route path="sales" element={<Navigate to="/ventes" replace />} />

        {/* Inventaire / Inventory */}
        <Route path="inventaire" element={<Inventaire />} />
        <Route path="inventory" element={<Navigate to="/inventaire" replace />} />

        {/* Clients */}
        <Route path="clients" element={<Clients />} />

        {/* Entrepôt / Warehouse */}
        <Route path="entrepot" element={<Entrepot />} />
        <Route path="warehouse" element={<Navigate to="/entrepot" replace />} />

        {/* Demandes / Requests */}
        <Route path="demandes" element={<Demandes />} />
        <Route path="requests" element={<Navigate to="/demandes" replace />} />

        {/* Utilisateurs / Users */}
        <Route path="utilisateurs" element={<Utilisateurs />} />
        <Route path="users" element={<Navigate to="/utilisateurs" replace />} />

        {/* Rapports / Reports */}
        <Route path="rapports" element={<Rapports />} />
        <Route path="reports" element={<Navigate to="/rapports" replace />} />

        {/* Historique / History */}
        <Route path="historique" element={<Historique />} />
        <Route path="history" element={<Navigate to="/historique" replace />} />

        {/* Paramètres / Settings */}
        <Route path="parametres" element={<Parametres />} />
        <Route path="settings" element={<Navigate to="/parametres" replace />} />

        {/* Profil / Profile */}
        <Route path="profil" element={<Profil />} />
        <Route path="profile" element={<Navigate to="/profil" replace />} />

        {/* Notifications */}
        <Route path="notifications" element={<Notifications />} />

        {/* Sauvegardes / Backups */}
        <Route path="sauvegardes" element={<Sauvegardes />} />
        <Route path="backups" element={<Navigate to="/sauvegardes" replace />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
