import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useMockStore } from '../data/useMockStore';

interface RoleProtectedRouteProps {
  allowedRoles: ('gerant' | 'boutiquier')[];
  fallbackPath?: string;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  allowedRoles,
  fallbackPath = '/',
}) => {
  const { session } = useMockStore();

  if (!session || !allowedRoles.includes(session.role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;
