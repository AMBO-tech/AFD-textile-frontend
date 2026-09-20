/**
 * Query Keys Factory
 * Centralise et structure toutes les clés de cache TanStack Query
 * pour éviter les chaînes de caractères magiques et standardiser l'invalidation.
 */

export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
  },
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: Record<string, unknown> = {}) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string | number) => [...queryKeys.users.details(), id] as const,
  },
} as const

/**
 * Helper générique pour créer rapidement des Query Keys pour de futures features
 * Exemple: const clientKeys = createEntityKeys('clients')
 */
export function createEntityKeys<T extends string>(entity: T) {
  return {
    all: [entity] as const,
    lists: () => [entity, 'list'] as const,
    list: (filters: Record<string, unknown> = {}) => [entity, 'list', filters] as const,
    details: () => [entity, 'detail'] as const,
    detail: (id: string | number) => [entity, 'detail', id] as const,
  }
}
