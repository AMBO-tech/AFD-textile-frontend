import { useAuthStore } from '../../stores/useAuthStore';
import React from 'react';
import { Clients } from '../../components/clients';

export const ClientsPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;
  return <Clients role={user.role} />;
};

export default ClientsPage;
