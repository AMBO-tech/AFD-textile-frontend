import { useAuthStore } from '../../stores/useAuthStore';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stock } from '../../components/stock';

export const StockPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <Stock
      role={user.role}
      boutiqueId={user.locationId ?? null}
      onNavigate={(s) => navigate(s === 'accueil' ? '/' : `/${s}`)}
    />
  );
};

export default StockPage;
