import { API } from './api';

export interface AuditEntry {
  id: string;
  utilisateurId: string;
  action: string;
  ressourceType: string;
  ressourceId: string;
  ancienneValeur?: Record<string, unknown> | null;
  nouvelleValeur?: Record<string, unknown> | null;
  createdAt: string;
  utilisateur: { id: string; nom: string; telephone: string; role: 'OWNER' | 'BOUTIQUIER' };
}

export interface AuditPage {
  items: AuditEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditQuery {
  page?: number;
  limit?: number;
  utilisateurId?: string;
  action?: string;
  ressourceType?: string;
  dateDebut?: string;
  dateFin?: string;
}

/** Journal d'activité (réservé au gérant) : GET /audit, le plus récent d'abord. */
export const auditService = {
  getLogs: async (params: AuditQuery) => {
    const res = await API.get<AuditPage>('/audit', { params });
    return res.data;
  },
};

export default auditService;
