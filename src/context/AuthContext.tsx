import React, { createContext, useCallback, useMemo } from 'react'
import type { AuthContextType, User, UserRole } from '@/types/auth'
import { useAuthStore } from '@/stores/useAuthStore'
import { useCurrentUser } from '@/hooks/auth/useCurrentUser'
import { useLogout } from '@/hooks/auth/useLogout'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'

export const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient()
  const { user: storeUser, isAuthenticated, isInitialized, setAuth } = useAuthStore()
  const { logout } = useLogout()

  // Requête TanStack Query pour hydrater et synchroniser l'utilisateur
  const { data: queryUser, isLoading: isQueryLoading, refetch } = useCurrentUser()

  const user = queryUser || storeUser

  const login = useCallback(
    async (token: string, userData?: User): Promise<void> => {
      setAuth(token, userData || null)
      if (userData) {
        queryClient.setQueryData(queryKeys.auth.me(), userData)
      } else {
        await refetch()
      }
    },
    [setAuth, queryClient, refetch]
  )

  const refreshUser = useCallback(async (): Promise<void> => {
    await refetch()
  }, [refetch])

  const hasRole = useCallback(
    (roles: UserRole | UserRole[]): boolean => {
      if (!user || !user.role) return false
      if (Array.isArray(roles)) {
        return roles.includes(user.role)
      }
      return user.role === roles
    },
    [user]
  )

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false
      if (user.role === 'ADMIN') return true
      return Boolean(user.permissions?.includes(permission))
    },
    [user]
  )

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated,
      isInitializing: !isInitialized && isQueryLoading,
      loading: !isInitialized && isQueryLoading,
      login: login as any,
      logout: logout as any,
      refreshUser,
      hasRole,
      hasPermission,
    }),
    [user, isAuthenticated, isInitialized, isQueryLoading, login, logout, refreshUser, hasRole, hasPermission]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { useAuth } from '@/hooks/useAuth'
export default AuthProvider
