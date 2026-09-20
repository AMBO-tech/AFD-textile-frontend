import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Demandes } from '../../components/demandes';
import { useMockStore } from '../../data/useMockStore';

export const DemandesPage: React.FC = () => {
  const { session, boutiques } = useMockStore();
  const navigate = useNavigate();

  if (!session) return null;

  const boutiqueId = session.boutiqueId || boutiques[0]?.id || 'b1';

  return (
    <Demandes
      role={session.role}
      boutiqueId={boutiqueId}
      onNavigate={(s) => navigate(s === 'accueil' ? '/' : `/${s}`)}
    />
  );
};

export default DemandesPage;
