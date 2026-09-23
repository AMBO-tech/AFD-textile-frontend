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
  useAuthStore.getState().setAuth(accessToken, useAuthStore.getState().user, newRefreshToken ?? refreshToken);
  return accessToken;
}

// ─── Response Interceptor (Handle 401 with Queue-based Silent Refresh) ────────

API.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
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
    const serverError = error.response?.data as (Partial<ApiError> & { message?: string | string[]; error?: string }) | undefined;
    if (serverError?.message) {
      return Array.isArray(serverError.message)
        ? serverError.message.join(', ')
        : serverError.message;
    }
    if (error.response?.status === 400) return 'Requête invalide. Veuillez vérifier les informations saisies.';
    if (error.response?.status === 401) return 'Identifiant ou mot de passe incorrect. Vérifiez vos accès.';
    if (error.response?.status === 403) return 'Accès non autorisé : vous n\'avez pas les permissions requises.';
    if (error.response?.status === 404) return 'Ressource introuvable ou service indisponible.';
    if (error.response?.status === 409) return 'Un conflit est survenu (cette entrée existe peut-être déjà).';
    if (error.response?.status === 422) return 'Les données transmises sont non valides ou incomplètes.';
    if (error.response?.status === 429) return 'Trop de tentatives effectuées. Veuillez patienter un instant avant de réessayer.';
    if (error.response?.status === 500) return 'Erreur interne du serveur. Veuillez réessayer dans quelques instants.';
    if (!error.response) return 'Impossible de joindre le serveur. Vérifiez votre connexion internet.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return defaultMessage;
}

export default API;
