import { useAuthStore } from '../../stores/useAuthStore';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Parametres } from '../../components/parametres';

export const ParametresPage: React.FC = () => {
  const user = useAuthStore((s: any) => s.user); const session = user;
const setSession: any = [];
const boutiques: any = [];
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
