import React from 'react';
import { Historique } from '../../components/historique';
import { useMockStore } from '../../data/useMockStore';

export const HistoriquePage: React.FC = () => {
  const { session, boutiques } = useMockStore();

  const boutiqueId = session?.boutiqueId || boutiques[0]?.id || 'b1';

  return <Historique role={session?.role || 'gerant'} boutiqueId={boutiqueId} />;
};

export default HistoriquePage;
