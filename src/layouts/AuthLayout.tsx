import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Spinner } from '@/components/ui/spinner'

export const AuthLayout = () => {
  const { isAuthenticated, isInitializing } = useAuth()

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="size-8 text-primary" />
      </div>
    )
  }

  // Si l'utilisateur est déjà connecté, rediriger vers l'accueil
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-muted/30">
      <Outlet />
    </div>
  )
}

export default AuthLayout
