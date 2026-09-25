import { useCallback } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { LOGIN } from '../services/auth/login';
import type { LoginRequest, User } from '../types/auth';
import { useQueryClient } from '@tanstack/react-query';

/**
 * @hook useAuthUser
 * @description Hook universel d'authentification pour AFD Textile.
 * Offre un pont harmonieux entre le store d'authentification réel (JWT)
 * et la session legacy (useMockStore) pour une compatibilité ascendante totale.
 */
export const useAuthUser = () => {
  const queryClient = useQueryClient();
  const { user, token, isAuthenticated, isInitialized, clearAuth, setAuth, isGerant, isBoutiquier, hasRole } =
    useAuthStore();

  const login = useCallback(
    async (credentials: LoginRequest) => {
      const response = await LOGIN(credentials);
      if (response.accessToken && response.user) {
        setAuth(response.accessToken, response.user, response.refreshToken);
        queryClient.invalidateQueries();
      }
      return response;
    },
    [setAuth, queryClient]
  );

  const logout = useCallback(() => {
    clearAuth();
    queryClient.clear();
  }, [clearAuth, queryClient]);

  const isLogged = isAuthenticated;

  return {
    user: user,
    token,
    isAuthenticated: isLogged,
    isInitialized,
    login,
    logout,
    isGerant: () => (user ? isGerant() : false),
    isBoutiquier: () => (user ? isBoutiquier() : false),
    hasRole,
  };
};

export default useAuthUser;
