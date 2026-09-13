import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { toast } from 'sonner'
import { useCallback } from 'react'

export const useLogout = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const clearAuth = useAuthStore((state) => state.clearAuth)

  const logout = useCallback(() => {
    // 1. Vider le store d'authentification et le stockage de token
    clearAuth()

    // 2. Vider complètement le cache de requêtes TanStack Query
    queryClient.clear()

    // 3. Notifier l'utilisateur
    toast.info('Vous avez été déconnecté.')

    // 4. Rediriger vers la page de connexion
    navigate('/login')
  }, [clearAuth, queryClient, navigate])

  return { logout }
}

export default useLogout
