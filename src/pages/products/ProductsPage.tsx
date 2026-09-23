import { useAuthStore } from '@/stores/useAuthStore';
import React from 'react';
import { Products } from '../../components/products';

export const ProductsPage: React.FC = () => {
  const user = useAuthStore((s: any) => s.user);
  const session = user;

  if (!session) return null;

  return <Products role={session.role} />;
};

export default ProductsPage;
