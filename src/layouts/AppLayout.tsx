import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Navigation } from '../components/navigation';
import type { Screen } from '../components/navigation/types';
import { useMockStore } from '../data/useMockStore';
import { Toaster } from '../components/ui/sonner';

export const AppLayout: React.FC = () => {
  const { session, setSession, notifications, demandes, boutiques } = useMockStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!session) return null;

  const boutiqueCourante =
    boutiques.find((b) => b.id === (session.boutiqueId || 'b1')) || boutiques[0];

  const unreadNotifs = notifications.filter((n) => !n.lu).length;
  const pendingDemandes = demandes.filter((d) => d.statut === 'en_attente').length;

  // Déduire l'écran actif à partir de l'URL
  const getScreenFromPath = (path: string): Screen => {
    const p = path.replace(/^\//, '').split('/')[0];
    if (!p || p === 'dashboard') return 'accueil';
    const validScreens: Screen[] = [
      'accueil', 'produits', 'stock', 'ventes', 'clients', 'demandes',
      'notifications', 'profil', 'dashboard_admin', 'utilisateurs',
      'entrepot', 'rapports', 'historique', 'boutiques', 'parametres'
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
    setSession(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen" style={{ background: '#F5F7FA' }}>
      <Toaster richColors position="top-right" />
      <Navigation
        role={session.role}
        current={currentScreen}
        onNavigate={handleNavigate}
        nom={session.nom}
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
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 lg:py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
