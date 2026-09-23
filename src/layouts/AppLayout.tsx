import { useAuthStore } from '../stores/useAuthStore';
import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Navigation } from '../components/navigation';

export const AppLayout: React.FC = () => {
  const user = useAuthStore((s: any) => s.user); const session = user;
const setSession: any = [];
const notifications: any = [];
const demandes: any = [];
const boutiques: any = [];
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!session) return null;

  const boutiqueCourante =
    boutiques.find((b: any) => b.id === (session.boutiqueId || 'b1')) || boutiques[0];

  const unreadNotifs = notifications.filter((n: any) => !n.lu).length;
  const pendingDemandes = demandes.filter((d: any) => d.statut === 'en_attente').length;

  // Déduire l'écran actif à partir de l'URL
  const getScreenFromPath = (path: string): string => {
    const p = path.replace(/^\//, '').split('/')[0];
    if (!p || p === 'dashboard') return 'accueil';
    return p;
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
      <Navigation
        role={session.role}
        current={currentScreen as any}
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
