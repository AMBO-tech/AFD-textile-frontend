import { API } from './api';
import type { Client, CreateClientDto, UpdateClientDto, ClientQueryParams, ClientDebtsStatementDto } from '@/types/clients';
import type { MoyenPaiement } from '@/types/enums';
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
    const res = await API.get<ClientDebtsStatementDto>(`/clients/${id}/creances`);
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
   * Règlement d'un client — POST /reglements. Le serveur répartit le montant sur les factures
   * impayées les plus anciennes (FIFO). boutiqueId est requis pour un gérant (caisse encaissante).
   */
  recordPayment: async (data: {
    clientId: string;
    montantTotal: number;
    modePaiement: MoyenPaiement;
    boutiqueId?: string;
    referenceExterne?: string;
    idempotencyKey?: string;
  }) => {
    const res = await API.post<{ id: string; referenceRecu: string; montantTotal: number }>(
      '/reglements',
      data,
    );
    return res.data;
  },
};

export default clientsService;
