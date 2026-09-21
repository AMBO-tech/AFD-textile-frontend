import { API } from './api';

export const clientsService = {
  getAll: async (params?: any) => {
    const res = await API.get('/clients', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await API.get(`/clients/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await API.post('/clients', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await API.put(`/clients/${id}`, data);
    return res.data;
  },
  recordPayment: async (clientId: string, data: any) => {
    const res = await API.post(`/clients/${clientId}/paiements`, data);
    return res.data;
  },
};
