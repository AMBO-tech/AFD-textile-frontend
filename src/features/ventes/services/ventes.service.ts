import { API } from '../../../services/api';

export const ventesService = {
  getAll: async (params?: any) => {
    const res = await API.get('/ventes', { params });
    return res.data;
  },
  create: async (data: any) => {
    const res = await API.post('/ventes', data);
    return res.data;
  },
  cancel: async (id: string, motif: string) => {
    const res = await API.post(`/ventes/${id}/annuler`, { motif });
    return res.data;
  },
};
