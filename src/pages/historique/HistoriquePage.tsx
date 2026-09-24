import { useAuthStore } from '../../stores/useAuthStore';
import React from 'react';
import { Historique } from '../../components/historique';

export const HistoriquePage: React.FC = () => {
  const user = useAuthStore((s: any) => s.user); const session = user;
const boutiques: any = [];

  const boutiqueId = session?.boutiqueId || boutiques[0]?.id || 'b1';

  return <Historique role={session?.role || 'gerant'} boutiqueId={boutiqueId} />;
};

export default HistoriquePage;
