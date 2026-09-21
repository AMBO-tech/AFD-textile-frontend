import { API } from './api';

export const boutiquesService = {
  getAll: async () => {
    const res = await API.get('/boutiques');
    return res.data;
  },
  getById: async (id: string) => {
    const res = await API.get(`/boutiques/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await API.post('/boutiques', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await API.put(`/boutiques/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await API.delete(`/boutiques/${id}`);
    return res.data;
  },
};
