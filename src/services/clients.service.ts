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
   * Enregistrement d'un règlement de créance — route : POST /reglements
   * Formate la payload selon CreatePaymentDto (clientId, montantTotal, modePaiement, ventilations)
   */
  recordPayment: async (
    clientId: string,
    data: {
      montant: number;
      modePaiement: string;
      referenceExterne?: string;
      venteId?: string;
    },
  ) => {
    const normalizedMode = (data.modePaiement || 'ESPECES').toUpperCase();

    const payload: Record<string, any> = {
      clientId,
      montantTotal: data.montant,
      modePaiement: normalizedMode,
      referenceExterne: data.referenceExterne,
    };

    if (data.venteId) {
      payload.modeVentilation = 'MANUELLE';
      payload.ventilationsManuelles = [
        {
          venteId: data.venteId,
          montant: data.montant,
        },
      ];
    } else {
      payload.modeVentilation = 'FIFO_AUTO';
    }

    const res = await API.post<{ id: string; referenceRecu: string }>('/reglements', payload);
    return res.data;
  },
};

export default clientsService;
