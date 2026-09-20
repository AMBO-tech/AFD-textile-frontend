import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes de validité de cache par défaut
      gcTime: 1000 * 60 * 30, // 30 minutes de conservation en mémoire
      retry: (failureCount, error) => {
        // Ne pas retry sur les erreurs 401 ou 403
        if (typeof error === 'object' && error !== null && 'status' in error) {
          const status = (error as { status: number }).status
          if (status === 401 || status === 403 || status === 404) return false
        }
        return failureCount < 1
      },
      refetchOnWindowFocus: false, // Évite les rafraîchissements intempestifs en dev/saisie
    },
    mutations: {
      retry: false,
    },
  },
})
