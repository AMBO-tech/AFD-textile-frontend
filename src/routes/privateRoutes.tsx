import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/context/AuthContext'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

export const PrivateRoutes = () => {
  const { isAuthenticated, isInitializing } = useAuth()
  const location = useLocation()

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-8 text-primary" />
      </div>
    )
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />
}

export default PrivateRoutes
