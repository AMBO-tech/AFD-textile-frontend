import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API } from '@/services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NotificationItem {
  id: string;
  userId: string | null;
  locationId: string | null;
  titre: string;
  message: string;
  type: string;
  referenceId: string | null;
  lu: boolean;
  createdAt: string;
}

export interface PaginatedNotificationsResponse {
  data: NotificationItem[];
  nonLuesTotal: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QueryNotificationsParams {
  page?: number;
  limit?: number;
  lu?: boolean;
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const NOTIFICATION_KEYS = {
  all: ['notifications'] as const,
  list: (params?: QueryNotificationsParams) => ['notifications', 'list', params] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * @hook useNotificationsQuery
 * Récupère les notifications paginées de l'utilisateur courant via GET /api/v1/notifications
 */
export function useNotificationsQuery(params?: QueryNotificationsParams) {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.list(params),
    queryFn: async () => {
      const res = await API.get<PaginatedNotificationsResponse>('/notifications', { params });
      return res.data;
    },
    staleTime: 30_000,   // 30s — les notifications sont relativement fraîches
    refetchInterval: 60_000, // polling toutes les 60s pour les nouvelles alertes
  });
}

/**
 * @hook useMarkNotificationReadMutation
 * Marque une notification comme lue via PATCH /api/v1/notifications/:id/lire
 */
export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await API.patch<NotificationItem>(`/notifications/${id}/lire`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
  });
}

/**
 * @hook useMarkAllNotificationsReadMutation
 * Marque toutes les notifications comme lues via PATCH /api/v1/notifications/tout-lire
 */
export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await API.patch<{ count: number }>('/notifications/tout-lire');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
  });
}
