import { API } from './api';
import type { Location, CreateLocationDto, UpdateLocationDto } from '@/types/locations';

export const boutiquesService = {
  getAll: async (params?: Record<string, unknown>) => {
    const res = await API.get<{ data: Location[] }>('/locations', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await API.get<Location>(`/locations/${id}`);
    return res.data;
  },
  create: async (data: CreateLocationDto) => {
    const res = await API.post<Location>('/locations', data);
    return res.data;
  },
  update: async (id: string, data: UpdateLocationDto) => {
    const res = await API.patch<Location>(`/locations/${id}`, data);
    return res.data;
  },
  /** Bascule le statut actif/inactif d'une boutique — route correcte : PATCH /locations/:id/toggle-status */
  toggleStatus: async (id: string) => {
    const res = await API.patch<Location>(`/locations/${id}/toggle-status`);
    return res.data;
  },
};

export default boutiquesService;
