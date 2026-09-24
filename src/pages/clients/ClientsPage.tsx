import { useAuthStore } from '../../stores/useAuthStore';
import React from 'react';
import { Clients } from '../../components/clients';

export const ClientsPage: React.FC = () => {
  const user = useAuthStore((s: any) => s.user); const session = user;
const boutiques: any = [];

  if (!session) return null;

  const boutiqueId = session.boutiqueId || boutiques[0]?.id || 'b1';

  return <Clients role={session.role} boutiqueId={boutiqueId} />;
};

export default ClientsPage;
