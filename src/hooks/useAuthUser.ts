import { useCallback } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { LOGIN } from '../services/auth/login';
import type { LoginRequest, User } from '../types/auth';
import { useQueryClient } from '@tanstack/react-query';
import { useMockStore } from '../data/useMockStore';

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
  const { setSession, session: mockSession } = useMockStore();

  const login = useCallback(
    async (credentials: LoginRequest) => {
      const response = await LOGIN(credentials);
      if (response.accessToken && response.user) {
        setAuth(response.accessToken, response.user);
        // Synchroniser le mock store pour que les composants legacy qui s'y fient continuent de fonctionner
        const role = response.user.role === 'OWNER' ? 'gerant' : 'boutiquier';
        setSession({
          role,
          nom: response.user.nom,
          boutiqueId: response.user.locationId || undefined,
        });
        queryClient.invalidateQueries();
      }
      return response;
    },
    [setAuth, setSession, queryClient]
  );

  const logout = useCallback(() => {
    clearAuth();
    setSession(null as unknown as { role: 'gerant' | 'boutiquier'; nom: string; boutiqueId?: string });
    queryClient.clear();
  }, [clearAuth, setSession, queryClient]);

  // Utilisateur actif : priorité à useAuthStore, fallback sur mockSession si mode démo
  const activeUser: Partial<User> = user || {
    id: 'demo-user',
    nom: mockSession?.nom || 'Utilisateur AFD',
    name: mockSession?.nom || 'Utilisateur AFD',
    role: mockSession?.role === 'gerant' ? 'OWNER' : 'BOUTIQUIER',
    locationId: mockSession?.boutiqueId,
    boutiqueId: mockSession?.boutiqueId,
    telephone: '+221770000000',
  };

  const isLogged = isAuthenticated || Boolean(mockSession);

  return {
    user: activeUser,
    token,
    isAuthenticated: isLogged,
    isInitialized,
    login,
    logout,
    isGerant: () => (user ? isGerant() : mockSession?.role === 'gerant'),
    isBoutiquier: () => (user ? isBoutiquier() : mockSession?.role === 'boutiquier'),
    hasRole,
  };
};

export default useAuthUser;
