import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Parametres } from '../../components/parametres';
import { useMockStore } from '../../data/useMockStore';

import { useAuthStore } from '../../stores/useAuthStore';

export const ParametresPage: React.FC = () => {
  const { session, setSession, boutiques } = useMockStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const role = session?.role || (user?.role === 'OWNER' ? 'gerant' : 'boutiquier');
  const nom = session?.nom || user?.nom || user?.name || 'Utilisateur AFD';
  const boutiqueId = session?.boutiqueId || user?.locationId || boutiques[0]?.id || 'b1';

  const handleLogout = () => {
    setSession(null);
    navigate('/login');
  };

  return (
    <Parametres
      nom={nom}
      role={role}
      boutiqueId={boutiqueId}
      onLogout={handleLogout}
    />
  );
};

export default ParametresPage;
