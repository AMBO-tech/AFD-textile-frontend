import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useMockStore } from '../data/useMockStore';

export const ProtectedRoute: React.FC = () => {
  const { session } = useMockStore();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
