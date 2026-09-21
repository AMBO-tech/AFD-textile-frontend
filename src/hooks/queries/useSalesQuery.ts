import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ventesService } from '../../services/ventes.service';
import type { CreateSaleDto } from '../../types/sales';
import { STOCK_KEYS } from './useStocksQuery';

export const SALES_KEYS = {
  all: ['sales'] as const,
  lists: () => [...SALES_KEYS.all, 'list'] as const,
  list: (params?: Record<string, unknown>) => [...SALES_KEYS.lists(), params] as const,
  details: () => [...SALES_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...SALES_KEYS.details(), id] as const,
};

/**
 * Récupère l'historique des ventes
 */
export const useSalesListQuery = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: SALES_KEYS.list(params),
    queryFn: () => ventesService.getAll(params),
    staleTime: 1000 * 60 * 2,
  });
};

/**
 * Récupère le détail d'une vente par ID
 */
export const useSaleDetailQuery = (id: string) => {
  return useQuery({
    queryKey: SALES_KEYS.detail(id),
    queryFn: () => ventesService.getById(id),
    enabled: Boolean(id),
  });
};

/**
 * Mutation pour valider une vente directe ou panier au comptoir
 */
export const useCreateSaleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSaleDto) => ventesService.create(data),
    onSuccess: () => {
      // Invalider les ventes et les stocks en temps réel
      queryClient.invalidateQueries({ queryKey: SALES_KEYS.all });
      queryClient.invalidateQueries({ queryKey: STOCK_KEYS.all });
    },
  });
};

/**
 * Mutation pour annuler une vente avec motif
 */
export const useCancelSaleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motif }: { id: string; motif: string }) => ventesService.cancel(id, motif),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALES_KEYS.all });
      queryClient.invalidateQueries({ queryKey: STOCK_KEYS.all });
    },
  });
};
