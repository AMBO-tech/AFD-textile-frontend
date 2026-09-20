import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Parametres } from '../../components/parametres';
import { useMockStore } from '../../data/useMockStore';

export const ParametresPage: React.FC = () => {
  const { session, setSession, boutiques } = useMockStore();
  const navigate = useNavigate();

  if (!session) return null;

  const boutiqueId = session.boutiqueId || boutiques[0]?.id || 'b1';

  const handleLogout = () => {
    setSession(null);
    navigate('/login');
  };

  return (
    <Parametres
      nom={session.nom}
      role={session.role}
      boutiqueId={boutiqueId}
      onLogout={handleLogout}
    />
  );
};

export default ParametresPage;
