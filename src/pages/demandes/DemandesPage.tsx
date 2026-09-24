import { useAuthStore } from '../../stores/useAuthStore';
import React from 'react';
import { Demandes } from '../../components/demandes';

export const DemandesPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;
  return <Demandes role={user.role} boutiqueId={user.locationId ?? null} />;
};

export default DemandesPage;
