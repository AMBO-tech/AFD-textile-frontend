import { API } from './api';
import type { StockLevel, MouvementStock, Transfert } from '@/types/stocks';
import type { PaginatedResponse } from '@/types/api';
import type { MouvementSens, MouvementType, UniteStockage } from '@/types/enums';

export const stocksService = {
  getLevels: async (params?: { locationId?: string; categorieId?: string; enAlerte?: boolean; page?: number; limit?: number }) => {
    const res = await API.get<PaginatedResponse<StockLevel>>('/stocks/niveaux', { params });
    return res.data;
  },
  getMovements: async (params?: Record<string, unknown>) => {
    const res = await API.get<PaginatedResponse<MouvementStock>>('/stocks/mouvements', { params });
    return res.data;
  },
  /** Inventaire : fixe la quantité réellement comptée (dans l'unité de stock du produit). */
  adjust: async (data: {
    produitId: string;
    locationId: string;
    nouvelleQuantite: number;
    uniteUtilisee: UniteStockage;
    justification: string;
  }) => {
    const res = await API.post<StockLevel>('/stocks/ajustement', data);
    return res.data;
  },
  /**
   * Mouvement de stock manuel (ex. arrivage : type ENTREE_MANUELLE, sens ENTREE).
   * Crée la ligne de stock si le produit n'existait pas encore à cet emplacement ;
   * prixVente / prixMinimum fixent le prix propre à cet emplacement.
   */
  executeMovement: async (data: {
    produitId: string;
    locationId: string;
    quantite: number;
    type: MouvementType;
    uniteUtilisee: UniteStockage;
    sens: MouvementSens;
    justification?: string;
    prixVente?: number;
    prixMinimum?: number;
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
