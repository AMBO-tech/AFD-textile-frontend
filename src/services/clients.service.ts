import { API } from './api';
import type { Client, CreateClientDto, UpdateClientDto, ClientQueryParams, ClientInvoiceDebtDto } from '@/types/clients';
import type { PaginatedResponse } from '@/types/api';

/**
 * @service clientsService
 * Contrat : backend NestJS /api/v1/clients + /api/v1/reglements
 *
 * Corrections appliquées :
 *  - archive  → DELETE /clients/:id  (l'ancienne route PATCH /archiver n'existe pas)
 *  - recordPayment → POST /reglements  (route canonique backend)
 */
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

  /** Suppression logique (archive) — route correcte : DELETE /clients/:id */
  archive: async (id: string) => {
    const res = await API.delete<Client>(`/clients/${id}`);
    return res.data;
  },

  /**
   * Enregistrement d'un règlement de créance — route correcte : POST /reglements
   * Le champ venteId est requis par le backend pour lier le paiement à la bonne facture.
   */
  recordPayment: async (
    venteId: string,
    data: { montant: number; modePaiement: string; referenceExterne?: string },
  ) => {
    const res = await API.post<{ id: string; referenceRecu: string }>('/reglements', {
      venteId,
      ...data,
    });
    return res.data;
  },
};

export default clientsService;
