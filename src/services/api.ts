import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { tokenStore } from '@/lib/tokenStore';
import { useAuthStore } from '@/stores/useAuthStore';
import type { ApiError } from '@/types/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const API = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request Interceptor (Inject Token) ───────────────────────────────────────

API.interceptors.request.use(
  (config) => {
    const token = tokenStore.get() || useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Silent Refresh Infrastructure ────────────────────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
}

/** Verrou partagé entre onglets : un seul rafraîchissement à la fois pour tout le navigateur. */
const VERROU_RAFRAICHISSEMENT = 'afd-auth-refresh';

async function rafraichir(jetonExpire: string | null): Promise<string> {
  // Un autre onglet a peut-être déjà renouvelé la session pendant l'attente du verrou :
  // on reprend alors son jeton au lieu de réutiliser un jeton de rafraîchissement consommé
  // (le serveur révoquerait toutes les sessions de l'utilisateur).
  const actuel = tokenStore.get();
  if (actuel && actuel !== jetonExpire) return actuel;

  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token available');

  const response = await axios.post<{ accessToken: string; refreshToken?: string }>(
    `${API_URL}/auth/refresh`,
    { refreshToken },
  );

  const { accessToken, refreshToken: newRefreshToken } = response.data;
  useAuthStore.getState().setAuth(accessToken, useAuthStore.getState().user, newRefreshToken);
  return accessToken;
}

/**
 * Renouvelle le jeton d'accès (15 min) avec le jeton de rafraîchissement (7 jours, renouvelé
 * à chaque fois). `jetonExpire` est le jeton refusé par le serveur.
 */
async function attemptRefresh(jetonExpire: string | null): Promise<string> {
  if (typeof navigator !== 'undefined' && navigator.locks?.request) {
    return navigator.locks.request(VERROU_RAFRAICHISSEMENT, () => rafraichir(jetonExpire));
  }
  return rafraichir(jetonExpire);
}

// ─── Response Interceptor (Handle 401 with Queue-based Silent Refresh) ────────

// Routes publiques : un 401 y signifie « identifiants / code invalides », pas « session expirée ».
// Les rafraîchir masquerait le vrai message d'erreur (et redirigerait vers /login).
const PUBLIC_AUTH_PATHS = [
  '/auth/login',
  '/auth/refresh',
  '/auth/setup-password',
  '/auth/otp/',
  '/auth/reset-password',
];

function isPublicAuthRequest(url?: string): boolean {
  return !!url && PUBLIC_AUTH_PATHS.some((path) => url.startsWith(path));
}

API.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isPublicAuthRequest(originalRequest.url)
    ) {
      if (isRefreshing) {
        // Queue this request until the ongoing refresh completes
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return API(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const jetonRefuse = String(originalRequest.headers?.Authorization ?? '').replace(/^Bearer /, '') || null;
        const newToken = await attemptRefresh(jetonRefuse);
        processQueue(null, newToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return API(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed → logout
        useAuthStore.getState().clearAuth();
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Déconnexion ──────────────────────────────────────────────────────────────

/**
 * Révoque le jeton de rafraîchissement côté serveur puis vide la session locale.
 * La session durant 7 jours sur l'appareil, la révocation compte (ordinateur partagé) ;
 * un échec réseau n'empêche jamais la déconnexion locale.
 */
export async function deconnecter(): Promise<void> {
  const refreshToken = tokenStore.getRefreshToken();
  try {
    if (tokenStore.get()) await API.post('/auth/logout', refreshToken ? { refreshToken } : {});
  } catch {
    // Jeton déjà expiré ou serveur injoignable : la session locale est effacée quand même.
  } finally {
    useAuthStore.getState().clearAuth();
  }
}

// ─── Helper: Normalisation des erreurs API ────────────────────────────────────

export function getErrorMessage(error: unknown, defaultMessage = 'Une erreur inattendue est survenue.'): string {
  if (axios.isAxiosError(error)) {
    const serverError = error.response?.data as (Partial<ApiError> & { message?: string | string[] }) | undefined;
    if (serverError?.message) {
      return Array.isArray(serverError.message)
        ? serverError.message.join(', ')
        : serverError.message;
    }
    if (error.response?.status === 404) return 'Ressource introuvable.';
    if (error.response?.status === 403) return 'Accès non autorisé.';
    if (error.response?.status === 500) return 'Erreur interne du serveur.';
    if (!error.response) return 'Impossible de joindre le serveur. Vérifiez votre connexion.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return defaultMessage;
}

export default API;
