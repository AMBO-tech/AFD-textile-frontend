import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthUser } from '../hooks/useAuthUser';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuthUser();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
