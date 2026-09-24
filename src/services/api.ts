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

async function attemptRefresh(): Promise<string> {
  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token available');

  const response = await axios.post<{ accessToken: string; refreshToken?: string }>(
    `${API_URL}/auth/refresh`,
    { refreshToken },
  );

  const { accessToken, refreshToken: newRefreshToken } = response.data;
  tokenStore.set(accessToken);
  if (newRefreshToken) tokenStore.setRefreshToken(newRefreshToken);
  useAuthStore.getState().setAuth(accessToken, useAuthStore.getState().user as any);
  return accessToken;
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
        const newToken = await attemptRefresh();
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
