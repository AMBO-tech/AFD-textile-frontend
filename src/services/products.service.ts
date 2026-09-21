import { API } from './api';

export const productsService = {
  getAll: async (params?: any) => {
    const res = await API.get('/produits', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await API.get(`/produits/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await API.post('/produits', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await API.put(`/produits/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await API.delete(`/produits/${id}`);
    return res.data;
  },
};
