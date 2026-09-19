import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stock } from '../../components/stock';
import { useMockStore } from '../../data/useMockStore';

export const StockPage: React.FC = () => {
  const { session, boutiques } = useMockStore();
  const navigate = useNavigate();

  if (!session) return null;

  const boutiqueId = session.boutiqueId || boutiques[0]?.id || 'b1';

  return (
    <Stock
      role={session.role}
      boutiqueId={boutiqueId}
      onNavigate={(s) => navigate(s === 'accueil' ? '/' : `/${s}`)}
    />
  );
};

export default StockPage;
