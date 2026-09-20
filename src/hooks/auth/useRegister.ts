import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { REGISTER } from '@/services/auth/register'
import { getErrorMessage } from '@/api/api'
import type { RegisterRequest, RegisterResponse, ApiError } from '@/types/auth'

export const useRegister = () => {
  const navigate = useNavigate()

  const mutation = useMutation<RegisterResponse | ApiError, Error, RegisterRequest>({
    mutationFn: (data) => REGISTER(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || 'Compte créé avec succès !')
        navigate('/login')
      } else {
        toast.error(response.message || 'Inscription échouée. Vérifiez vos informations.')
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Une erreur inattendue est survenue.'))
    },
  })

  return {
    register: (request: RegisterRequest) => mutation.mutateAsync(request),
    registerAsync: mutation.mutateAsync,
    loading: mutation.isPending,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}

export default useRegister