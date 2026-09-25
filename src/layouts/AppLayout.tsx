import { useAuthStore } from '../stores/useAuthStore';
import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Navigation } from '../components/navigation';
import { useLocationsListQuery } from '../hooks/queries/useLocationsQuery';
import { useTransfersQuery } from '../hooks/queries/useStocksQuery';

export const AppLayout: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const session = user as any;
  const notifications: any = [];

  const { data: locationsResponse } = useLocationsListQuery();
  // Badge : demandes de transfert en attente (le serveur limite le boutiquier aux siennes)
  const { data: demandesEnAttente } = useTransfersQuery({ statut: 'DEMANDE', limit: 1 });
  const boutiques = locationsResponse?.data || [];

  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!session) return null;

  // Le gérant n'est rattaché à aucun emplacement : l'en-tête affiche le réseau, pas un emplacement au hasard.
  const estGerant = session.role === 'OWNER';
  const boutiqueCourante = estGerant
    ? { id: 'reseau', nom: 'AFD Textile', lieu: `${boutiques.length} emplacement${boutiques.length > 1 ? 's' : ''}` }
    : (() => {
        const b = boutiques.find((l) => l.id === (session.boutiqueId || session.locationId));
        return b ? { id: b.id, nom: b.nom, lieu: b.adresse ?? (b.type === 'ENTREPOT' ? 'Entrepôt' : 'Boutique') } : { id: 'temp', nom: 'Chargement…', lieu: '' };
      })();

  const unreadNotifs = notifications.filter((n: any) => !n.lu).length;
  const pendingDemandes = demandesEnAttente?.total ?? demandesEnAttente?.meta?.total ?? 0;

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
    clearAuth();
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
        boutique={{ ...boutiqueCourante, lieu: boutiqueCourante.lieu || '' }}
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
