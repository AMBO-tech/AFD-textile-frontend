import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Navigation } from '../navigation';
import type { Screen } from '../navigation/types';

import { useAuthStore } from '../../stores/useAuthStore';
import { useNotificationsQuery } from '../../hooks/queries/useNotificationsQuery';
import { Toaster } from '../ui/sonner';

export const AppLayout: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const session = user as any;
  const demandes: any[] = [];
  const boutiques: any[] = [];
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Compteur de notifications non lues via API réelle (polling 60s)
  const { data: notifData } = useNotificationsQuery({ limit: 1 });
  const unreadNotifs = notifData?.nonLuesTotal ?? 0;

  // Déterminer la session active avec fallback immédiat sur le user authentifié
  const effectiveSession = session || (user ? {
    role: ((user as any).role === 'OWNER' ? 'gerant' : 'boutiquier') as 'gerant' | 'boutiquier',
    nom: (user as any).nom || (user as any).name || 'Utilisateur AFD',
    boutiqueId: (user as any).locationId || undefined,
  } : null);

  // Éviter l'écran blanc : si aucune session ni user actif, rediriger vers login
  if (!effectiveSession) {
    return <Navigate to="/login" replace />;
  }

  const boutiqueCourante =
    boutiques.find((b: any) => b.id === (effectiveSession.boutiqueId || boutiques[0]?.id)) || boutiques[0];

  const pendingDemandes = demandes.filter((d: any) => d.statut === 'en_attente').length;

  // Déduire l'écran actif à partir de l'URL
  const getScreenFromPath = (path: string): Screen => {
    const p = path.replace(/^\//, '').split('/')[0];
    if (!p || p === 'dashboard') return 'accueil';
    const validScreens: any[] = [
      'accueil', 'produits', 'stock', 'ventes', 'clients', 'demandes',
      'notifications', 'profil', 'dashboard_admin', 'utilisateurs',
      'entrepot', 'rapports', 'historique', "boutiques" as any, 'parametres'
    ];
    if (validScreens.includes(p as Screen)) {
      return p as Screen;
    }
    return 'accueil';
  };

  const currentScreen = getScreenFromPath(location.pathname);

  const handleNavigate = (screen: string) => {
    if (screen === 'accueil') {
      navigate('/');
    } else {
      navigate(`/${screen}`);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  // Préférer le nom depuis le store Zustand (API réelle) plutôt que la session mock
  const displayNom = user?.nom || user?.name || effectiveSession.nom;

  return (
    <div className="min-h-screen" style={{ background: '#F5F7FA' }}>
      <Toaster richColors position="top-right" />
      <Navigation
        role={effectiveSession.role as any}
        current={currentScreen}
        onNavigate={handleNavigate}
        nom={displayNom}
        onLogout={handleLogout}
        notifications={unreadNotifs}
        demandes={pendingDemandes}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        boutique={boutiqueCourante}
      />

      <div className="lg:pl-64">
        <main
          style={{
            paddingTop: 'calc(3.5rem + env(safe-area-inset-top))',
            paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))',
          }}
          className="lg:[padding-top:0] lg:[padding-bottom:0]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
