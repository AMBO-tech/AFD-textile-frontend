import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { deconnecter } from '@/services/api'
import { toast } from 'sonner'
import { useCallback } from 'react'

export const useLogout = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const logout = useCallback(async () => {
    // 1. Révoquer la session côté serveur et vider le stockage local
    await deconnecter()

    // 2. Vider complètement le cache de requêtes TanStack Query
    queryClient.clear()

    // 3. Notifier l'utilisateur
    toast.info('Vous avez été déconnecté.')

    // 4. Rediriger vers la page de connexion
    navigate('/login')
  }, [queryClient, navigate])

  return { logout }
}

export default useLogout
