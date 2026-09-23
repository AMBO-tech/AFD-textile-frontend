import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stock } from '../../components/stock';
import { useMockStore } from '../../data/useMockStore';

import { useAuthStore } from '../../stores/useAuthStore';

export const StockPage: React.FC = () => {
  const { session, boutiques } = useMockStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const role = session?.role || (user?.role === 'OWNER' ? 'gerant' : 'boutiquier');
  const boutiqueId = session?.boutiqueId || user?.locationId || boutiques[0]?.id || 'b1';

  return (
    <Stock
      role={role}
      boutiqueId={boutiqueId}
      onNavigate={(s) => navigate(s === 'accueil' ? '/' : `/${s}`)}
    />
  );
};

export default StockPage;
