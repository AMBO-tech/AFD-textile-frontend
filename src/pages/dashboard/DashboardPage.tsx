import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dashboard } from '../../components/dashboard';
import { useMockStore } from '../../data/useMockStore';

export const DashboardPage: React.FC = () => {
  const { session } = useMockStore();
  const navigate = useNavigate();

  if (!session) return null;

  const handleNavigate = (screen: string) => {
    switch (screen) {
      case 'accueil':
      case 'dashboard_admin':
        navigate('/');
        break;
      case 'ventes':
        navigate('/ventes');
        break;
      case 'stock':
        navigate('/stock');
        break;
      case 'clients':
        navigate('/clients');
        break;
      case 'demandes':
        navigate('/demandes');
        break;
      case 'entrepot':
        navigate('/entrepot');
        break;
      case 'utilisateurs':
        navigate('/utilisateurs');
        break;
      case 'rapports':
        navigate('/rapports');
        break;
      case 'historique':
        navigate('/historique');
        break;
      case 'sauvegardes':
        navigate('/sauvegardes');
        break;
      case 'parametres':
        navigate('/parametres');
        break;
      default:
        navigate(`/${screen}`);
    }
  };

  const handleVenteDirecte = (produitId: string) => {
    navigate(`/ventes?produit=${produitId}`);
  };

  return (
    <Dashboard
      role={session.role}
      onNavigate={handleNavigate}
      onVenteDirecte={handleVenteDirecte}
    />
  );
};

export default DashboardPage;
