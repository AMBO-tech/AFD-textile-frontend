import React from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { Products } from '../../components/products';

export const ProductsPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;
  return <Products role={user.role} />;
};

export default ProductsPage;
