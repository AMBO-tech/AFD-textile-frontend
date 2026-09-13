import { useQuery } from '@tanstack/react-query'
import { getCurrentUser } from '@/services/auth/currentUser'
import { queryKeys } from '@/lib/queryKeys'
import { useAuthStore } from '@/stores/useAuthStore'
import { useEffect } from 'react'
import type { User } from '@/types/auth'

export const useCurrentUser = () => {
  const token = useAuthStore((state) => state.token)
  const setUser = useAuthStore((state) => state.setUser)
  const setInitialized = useAuthStore((state) => state.setInitialized)
  const clearAuth = useAuthStore((state) => state.clearAuth)

  const query = useQuery<User, Error>({
    queryKey: queryKeys.auth.me(),
    queryFn: () => getCurrentUser(),
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 10, // 10 min
    retry: false,
  })

  useEffect(() => {
    if (!token) {
      setInitialized(true)
      return
    }

    if (query.data) {
      setUser(query.data)
      setInitialized(true)
    } else if (query.isError) {
      clearAuth()
      setInitialized(true)
    }
  }, [token, query.data, query.isError, setUser, setInitialized, clearAuth])

  return query
}

export default useCurrentUser
