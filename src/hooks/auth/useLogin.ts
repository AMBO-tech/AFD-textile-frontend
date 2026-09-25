import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { LOGIN } from '@/services/auth/login'
import { queryKeys } from '@/lib/queryKeys'
import { useAuthStore } from '@/stores/useAuthStore'
import { getErrorMessage } from '@/api/api'
import type { LoginRequest, LoginResponse, ApiError } from '@/types/auth'

export const useLogin = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const setAuth = useAuthStore((state) => state.setAuth)

  const mutation = useMutation<LoginResponse | ApiError, Error, LoginRequest>({
    mutationFn: (credentials) => LOGIN(credentials),
    onSuccess: (response) => {
      if (response.success || ('accessToken' in response && Boolean(response.accessToken))) {
        const token = 'accessToken' in response ? (response.accessToken as string) : '';
        // Enregistrer la session dans Zustand / tokenStore
        setAuth(token, response.user || null, 'refreshToken' in response ? response.refreshToken : undefined)

        // Pré-remplir le cache TanStack Query avec l'utilisateur si retourné par l'API
        if (response.user) {
          queryClient.setQueryData(queryKeys.auth.me(), response.user)
        } else {
          // Sinon forcer la récupération
          queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() })
        }

        toast.success(response.message || 'Connexion réussie')
        navigate('/')
      } else {
        toast.error(response.message || 'Identifiants invalides')
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Impossible de se connecter.'))
    },
  })

  return {
    handleLogin: (request: LoginRequest) => mutation.mutateAsync(request),
    login: mutation.mutate,
    loginAsync: mutation.mutateAsync,
    loading: mutation.isPending,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}

export default useLogin