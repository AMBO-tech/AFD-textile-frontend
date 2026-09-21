import { API } from './api';
import type { Client, CreateClientDto, UpdateClientDto, ClientQueryParams, ClientInvoiceDebtDto } from '@/types/clients';
import type { PaginatedResponse } from '@/types/api';

export const clientsService = {
  getAll: async (params?: ClientQueryParams) => {
    const res = await API.get<PaginatedResponse<Client>>('/clients', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await API.get<Client>(`/clients/${id}`);
    return res.data;
  },
  getDebts: async (id: string) => {
    const res = await API.get<ClientInvoiceDebtDto[]>(`/clients/${id}/creances`);
    return res.data;
  },
  create: async (data: CreateClientDto) => {
    const res = await API.post<Client>('/clients', data);
    return res.data;
  },
  update: async (id: string, data: UpdateClientDto) => {
    const res = await API.patch<Client>(`/clients/${id}`, data);
    return res.data;
  },
  archive: async (id: string) => {
    const res = await API.patch<Client>(`/clients/${id}/archiver`);
    return res.data;
  },
  recordPayment: async (clientId: string, data: { montant: number; modePaiement: string; referenceExterne?: string }) => {
    const res = await API.post<{ id: string; referenceRecu: string }>(`/clients/${clientId}/creances/reglement`, data);
    return res.data;
  },
};

export default clientsService;
