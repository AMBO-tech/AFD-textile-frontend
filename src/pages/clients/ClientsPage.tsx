import React from 'react';
import { Clients } from '../../components/clients';
import { useMockStore } from '../../data/useMockStore';

import { useAuthStore } from '../../stores/useAuthStore';

export const ClientsPage: React.FC = () => {
  const { session, boutiques } = useMockStore();
  const { user } = useAuthStore();

  const role = session?.role || (user?.role === 'OWNER' ? 'gerant' : 'boutiquier');
  const boutiqueId = session?.boutiqueId || user?.locationId || boutiques[0]?.id || 'b1';

  return <Clients role={role} boutiqueId={boutiqueId} />;
};

export default ClientsPage;
