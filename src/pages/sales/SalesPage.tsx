import { useAuthStore } from '@/stores/useAuthStore';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sales } from '../../components/sales';

export const SalesPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const session = user;
  const [searchParams, setSearchParams] = useSearchParams();
  const produitDirectId = searchParams.get('produit') || undefined;

  if (!session) return null;

  return (
    <Sales
      produitDirectId={produitDirectId}
      onReset={() => setSearchParams({})}
    />
  );
};

export default SalesPage;
