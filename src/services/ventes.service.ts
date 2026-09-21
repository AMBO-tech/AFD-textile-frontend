import { API } from './api';
import type { Vente, CreateSaleDto } from '@/types/sales';
import type { PaginatedResponse } from '@/types/api';

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
};

export default ventesService;
