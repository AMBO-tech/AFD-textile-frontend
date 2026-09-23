import React from 'react';
import { Products } from '../../components/products';
import { useMockStore } from '../../data/useMockStore';

import { useAuthStore } from '../../stores/useAuthStore';

export const ProductsPage: React.FC = () => {
  const { session } = useMockStore();
  const { user } = useAuthStore();

  const role = session?.role || (user?.role === 'OWNER' ? 'gerant' : 'boutiquier');

  return <Products role={role} />;
};

export default ProductsPage;
