import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stocksService } from '../../services/stocks.service';

export const STOCK_KEYS = {
  all: ['stocks'] as const,
  levels: (params?: { locationId?: string; categorieId?: string; enAlerte?: boolean; page?: number; limit?: number }) =>
    [...STOCK_KEYS.all, 'levels', params] as const,
  movements: (params?: Record<string, unknown>) => [...STOCK_KEYS.all, 'movements', params] as const,
  transfers: (params?: Record<string, unknown>) => [...STOCK_KEYS.all, 'transfers', params] as const,
};

/**
 * Récupère les niveaux de stock par boutique ou global
 */
export const useStockLevelsQuery = (params?: { locationId?: string; categorieId?: string; enAlerte?: boolean; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: STOCK_KEYS.levels(params),
    queryFn: () => stocksService.getLevels(params),
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};

/**
 * Récupère l'historique des mouvements de stock
 */
export const useStockMovementsQuery = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: STOCK_KEYS.movements(params),
    queryFn: () => stocksService.getMovements(params),
  });
};

/**
 * Mutation pour exécuter un mouvement physique (Entrée ou Sortie)
 */
export const useExecuteMovementMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      produitId: string;
      locationId: string;
      quantite: number;
      unite: string;
      sens: 'ENTREE' | 'SORTIE';
      justification?: string;
    }) => stocksService.executeMovement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STOCK_KEYS.all });
    },
  });
};

/**
 * Mutation pour un ajustement d'inventaire
 */
export const useAdjustStockMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      produitId: string;
      locationId: string;
      quantiteReelle: number;
      justification: string;
    }) => stocksService.adjust(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STOCK_KEYS.all });
    },
  });
};

/**
 * Mutation pour créer une demande de réassort / transfert
 */
export const useRequestTransferMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      locationDestinationId: string;
      locationSourceId?: string;
      lignes: { produitId: string; quantite: number; unite: string }[];
    }) => stocksService.requestTransfer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STOCK_KEYS.transfers() });
    },
  });
};
