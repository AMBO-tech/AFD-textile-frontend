import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sales } from '../../components/sales';
import { useMockStore } from '../../data/useMockStore';

export const SalesPage: React.FC = () => {
  const { session } = useMockStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const produitDirectId = searchParams.get('produit') || undefined;

  if (!session) return null;

  return (
    <Sales
      role={session.role}
      produitDirectId={produitDirectId}
      onReset={() => setSearchParams({})}
    />
  );
};

export default SalesPage;
