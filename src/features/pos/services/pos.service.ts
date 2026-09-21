import { API } from '../../../services/api';
import type { CreateSaleDto, Vente } from '@/types/sales';

export const posService = {
  createSale: async (saleData: CreateSaleDto) => {
    const res = await API.post<Vente>('/ventes', saleData);
    return res.data;
  },
};

export default posService;
