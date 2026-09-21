import { API } from '../../../services/api';

export const posService = {
  createSale: async (saleData: any) => {
    const res = await API.post('/ventes', saleData);
    return res.data;
  },
};
