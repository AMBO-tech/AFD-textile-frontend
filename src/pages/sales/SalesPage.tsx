import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sales } from '../../components/sales';
import { useMockStore } from '../../data/useMockStore';

import { useAuthStore } from '../../stores/useAuthStore';

export const SalesPage: React.FC = () => {
  const { session } = useMockStore();
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const produitDirectId = searchParams.get('produit') || undefined;

  const role = session?.role || (user?.role === 'OWNER' ? 'gerant' : 'boutiquier');

  return (
    <Sales
      role={role}
      produitDirectId={produitDirectId}
      onReset={() => setSearchParams({})}
    />
  );
};

export default SalesPage;
