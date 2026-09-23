import { API } from './api';
import type { Produit, CreateProduitDto, UpdateProduitDto, ProductQueryParams } from '@/types/products';
import type { PaginatedResponse } from '@/types/api';

export const productsService = {
  getAll: async (params?: ProductQueryParams) => {
    const res = await API.get<PaginatedResponse<Produit>>('/produits', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await API.get<Produit>(`/produits/${id}`);
    return res.data;
  },
  getByReference: async (ref: string) => {
    const res = await API.get<Produit>(`/produits/reference/${ref}`);
    return res.data;
  },
  create: async (data: CreateProduitDto) => {
    const res = await API.post<Produit>('/produits', data);
    return res.data;
  },
  update: async (id: string, data: UpdateProduitDto) => {
    const res = await API.patch<Produit>(`/produits/${id}`, data);
    return res.data;
  },
  archive: async (id: string) => {
    const res = await API.patch<Produit>(`/produits/${id}/archiver`);
    return res.data;
  },
  getCategories: async () => {
    const res = await API.get<any[]>('/produits/categories');
    return res.data;
  },
  getUnites: async () => {
    const res = await API.get<any[]>('/produits/unites');
    return res.data;
  },
};

export default productsService;
