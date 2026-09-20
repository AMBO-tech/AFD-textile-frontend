import React from 'react';
import { Clients } from '../../components/clients';
import { useMockStore } from '../../data/useMockStore';

export const ClientsPage: React.FC = () => {
  const { session, boutiques } = useMockStore();

  if (!session) return null;

  const boutiqueId = session.boutiqueId || boutiques[0]?.id || 'b1';

  return <Clients role={session.role} boutiqueId={boutiqueId} />;
};

export default ClientsPage;
