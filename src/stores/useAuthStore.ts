import { create } from 'zustand';
import type { User, UserRole } from '@/types/auth';
import { tokenStore } from '@/lib/tokenStore';

const USER_STORAGE_KEY = '__rsk_user__';

function getStoredUser(): User | null {
  try {
    const raw = sessionStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredUser(user: User | null): void {
  try {
    if (user) {
      sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isInitialized: boolean;
  isAuthenticated: boolean;

  // Actions
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setAuth: (token: string, user?: User | null, refreshToken?: string | null) => void;
  clearAuth: () => void;
  setInitialized: (initialized: boolean) => void;

  // Role & Permission Helpers
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  isGerant: () => boolean;
  isBoutiquier: () => boolean;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const initialToken = tokenStore.get();
  const initialRefreshToken = tokenStore.getRefreshToken();
  const initialUser = getStoredUser();

  return {
    token: initialToken,
    refreshToken: initialRefreshToken,
    user: initialUser,
    isInitialized: Boolean(initialToken),
    isAuthenticated: Boolean(initialToken),

    setToken: (token) => {
      if (token) {
        tokenStore.set(token);
      } else {
        tokenStore.clear();
      }
      set({ token, isAuthenticated: Boolean(token) });
    },

    setUser: (user) => {
      setStoredUser(user);
      set({ user });
    },

    setAuth: (token, user = null, refreshToken = null) => {
      tokenStore.set(token);
      if (refreshToken) tokenStore.setRefreshToken(refreshToken);
      setStoredUser(user);
      set({
        token,
        refreshToken,
        user,
        isAuthenticated: true,
        isInitialized: true,
      });
    },

    clearAuth: () => {
      tokenStore.clear();
      setStoredUser(null);
      set({
        token: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
        isInitialized: true,
      });
    },

    setInitialized: (isInitialized) => set({ isInitialized }),

    hasRole: (roles) => {
      const currentUser = get().user;
      if (!currentUser || !currentUser.role) return false;

      const normalizedUserRole =
        currentUser.role === 'OWNER' ? 'gerant' : currentUser.role === 'BOUTIQUIER' ? 'boutiquier' : currentUser.role;

      if (Array.isArray(roles)) {
        return roles.some((r) => {
          const norm = r === 'OWNER' ? 'gerant' : r === 'BOUTIQUIER' ? 'boutiquier' : r;
          return norm === normalizedUserRole || r === currentUser.role;
        });
      }
      const norm = roles === 'OWNER' ? 'gerant' : roles === 'BOUTIQUIER' ? 'boutiquier' : roles;
      return norm === normalizedUserRole || roles === currentUser.role;
    },

    isGerant: () => {
      const role = get().user?.role;
      return role === 'OWNER' || role === 'gerant';
    },

    isBoutiquier: () => {
      const role = get().user?.role;
      return role === 'BOUTIQUIER' || role === 'boutiquier';
    },

    hasPermission: (permission) => {
      const currentUser = get().user;
      if (!currentUser) return false;
      if (currentUser.role === 'OWNER' || currentUser.role === 'ADMIN' || currentUser.role === 'gerant') {
        return true;
      }
      return Boolean(currentUser.permissions?.includes(permission));
    },
  };
});

export default useAuthStore;
