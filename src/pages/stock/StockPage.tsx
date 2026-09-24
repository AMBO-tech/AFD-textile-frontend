import { useAuthStore } from '../../stores/useAuthStore';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stock } from '../../components/stock';

export const StockPage: React.FC = () => {
  const user = useAuthStore((s: any) => s.user); const session = user;
const boutiques: any = [];
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
