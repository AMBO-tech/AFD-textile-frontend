import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Spinner } from '@/components/ui/spinner'
import type { UserRole } from '@/types/auth'

interface RoleRouteProps {
  allowedRoles: UserRole[]
  children?: React.ReactNode
  fallbackPath?: string
}

export const RoleRoute: React.FC<RoleRouteProps> = ({
  allowedRoles,
  children,
  fallbackPath = '/',
}) => {
  const { user, isInitializing, hasRole } = useAuth()

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-8 text-primary" />
      </div>
    )
  }

  if (!user || !hasRole(allowedRoles)) {
    return <Navigate to={fallbackPath} replace />
  }

  return children ? <>{children}</> : <Outlet />
}

export default RoleRoute
