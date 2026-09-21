import { API } from './api';

export const stocksService = {
  getAll: async (boutiqueId?: string) => {
    const res = await API.get('/stocks', { params: { boutiqueId } });
    return res.data;
  },
  adjust: async (data: { produitId: string; boutiqueId: string; quantite: number; motif: string }) => {
    const res = await API.post('/stocks/ajustement', data);
    return res.data;
  },
  stockIn: async (data: any) => {
    const res = await API.post('/stocks/entree', data);
    return res.data;
  },
};
