import { API } from './api';
import type { StockLevel, MouvementStock, Transfert } from '@/types/stocks';
import type { PaginatedResponse } from '@/types/api';

export const stocksService = {
  getLevels: async (params?: { locationId?: string; categorieId?: string; enAlerte?: boolean; page?: number; limit?: number }) => {
    const res = await API.get<PaginatedResponse<StockLevel>>('/stocks/niveaux', { params });
    return res.data;
  },
  getMovements: async (params?: Record<string, unknown>) => {
    const res = await API.get<PaginatedResponse<MouvementStock>>('/stocks/mouvements', { params });
    return res.data;
  },
  adjust: async (data: { produitId: string; locationId: string; quantiteReelle: number; justification: string }) => {
    const res = await API.post<StockLevel>('/stocks/ajustement', data);
    return res.data;
  },
  /**
   * Déclenche un mouvement de stock manuel.
   * Corrections : `unite` → `uniteUtilisee`, ajout du champ `type` requis par le backend.
   */
  executeMovement: async (data: {
    produitId: string;
    locationId: string;
    quantite: number;
    type: 'ENTREE_STOCK' | 'SORTIE_STOCK' | 'AJUSTEMENT' | 'TRANSFERT_SORTIE' | 'TRANSFERT_ENTREE';
    uniteUtilisee: string;
    sens: 'ENTREE' | 'SORTIE';
    justification?: string;
  }) => {
    const res = await API.post<MouvementStock>('/stocks/mouvements', data);
    return res.data;
  },
  getTransfers: async (params?: Record<string, unknown>) => {
    const res = await API.get<PaginatedResponse<Transfert>>('/stocks/transferts', { params });
    return res.data;
  },
  requestTransfer: async (data: { locationDestinationId: string; locationSourceId?: string; lignes: { produitId: string; quantite: number; unite: string }[] }) => {
    const res = await API.post<Transfert>('/stocks/transferts/demande', data);
    return res.data;
  },
  validateTransfer: async (id: string) => {
    const res = await API.post<Transfert>(`/stocks/transferts/${id}/valider`);
    return res.data;
  },
};

export default stocksService;
