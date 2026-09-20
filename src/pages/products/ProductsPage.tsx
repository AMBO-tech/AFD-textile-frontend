import React from 'react';
import { Products } from '../../components/products';
import { useMockStore } from '../../data/useMockStore';

export const ProductsPage: React.FC = () => {
  const { session } = useMockStore();

  if (!session) return null;

  return <Products role={session.role} />;
};

export default ProductsPage;
