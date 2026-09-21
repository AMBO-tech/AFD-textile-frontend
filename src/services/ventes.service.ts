import { API } from './api';
import type { Vente, CreateSaleDto } from '@/types/sales';
import type { PaginatedResponse } from '@/types/api';

/**
 * @service ventesService
 * Contrat : backend NestJS /api/v1/ventes
 *
 * Ajout : syncOffline — soumet des ventes créées hors-ligne vers le backend
 */
export const ventesService = {
  getAll: async (params?: Record<string, unknown>) => {
    const res = await API.get<PaginatedResponse<Vente>>('/ventes', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await API.get<Vente>(`/ventes/${id}`);
    return res.data;
  },

  create: async (data: CreateSaleDto) => {
    const res = await API.post<Vente>('/ventes', data);
    return res.data;
  },

  cancel: async (id: string, motif: string) => {
    const res = await API.post<Vente>(`/ventes/${id}/annuler`, { motif });
    return res.data;
  },

  /**
   * Synchronise les ventes créées hors-ligne.
   * Envoie chaque vente séquentiellement et retourne les résultats (succès/échec).
   */
  syncOffline: async (pendingVentes: CreateSaleDto[]): Promise<{ synced: Vente[]; errors: { data: CreateSaleDto; error: string }[] }> => {
    const synced: Vente[] = [];
    const errors: { data: CreateSaleDto; error: string }[] = [];

    for (const vente of pendingVentes) {
      try {
        const res = await API.post<Vente>('/ventes', vente);
        synced.push(res.data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erreur inconnue';
        errors.push({ data: vente, error: message });
      }
    }

    return { synced, errors };
  },
};

export default ventesService;
