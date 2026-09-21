import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthUser } from '../hooks/useAuthUser';

interface RoleProtectedRouteProps {
  allowedRoles: ('gerant' | 'boutiquier' | 'OWNER' | 'BOUTIQUIER')[];
  fallbackPath?: string;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  allowedRoles,
  fallbackPath = '/',
}) => {
  const { isAuthenticated, isGerant, isBoutiquier } = useAuthUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const roleMatches =
    (isGerant() && (allowedRoles.includes('gerant') || allowedRoles.includes('OWNER'))) ||
    (isBoutiquier() && (allowedRoles.includes('boutiquier') || allowedRoles.includes('BOUTIQUIER')));

  if (!roleMatches) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;
