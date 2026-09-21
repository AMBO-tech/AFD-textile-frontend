import { QueryClient } from '@tanstack/react-query';

/**
 * @file queryClient.ts
 * @description Instance centrale et configurée de TanStack React Query.
 * Gère le cache en mémoire, les politiques d'invalidation et les retries pour AFD Textile.
 */

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Les données sont fraîches pendant 2 minutes (idéal pour le POS et les stocks dynamiques)
      staleTime: 1000 * 60 * 2,
      // Les données inactives restent en mémoire pendant 10 minutes avant garbage collection
      gcTime: 1000 * 60 * 10,
      // 1 seul réessai automatique en cas d'échec réseau
      retry: (failureCount, error: unknown) => {
        // Pas de retry pour les erreurs client 401, 403, 404
        if (typeof error === 'object' && error !== null && 'response' in error) {
          const status = (error as { response?: { status?: number } }).response?.status;
          if (status === 401 || status === 403 || status === 404) {
            return false;
          }
        }
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Pas de retry sur les mutations pour éviter les doublons financiers
      retry: false,
    },
  },
});

export default queryClient;
