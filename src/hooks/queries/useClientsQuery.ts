import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsService } from '../../services/clients.service';
import { ANALYTICS_KEYS } from './useAnalyticsQuery';
import type { CreateClientDto, UpdateClientDto, ClientQueryParams } from '../../types/clients';

export const CLIENT_KEYS = {
  all: ['clients'] as const,
  lists: () => [...CLIENT_KEYS.all, 'list'] as const,
  list: (params?: ClientQueryParams) => [...CLIENT_KEYS.lists(), params] as const,
  details: () => [...CLIENT_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...CLIENT_KEYS.details(), id] as const,
  debts: (id: string) => [...CLIENT_KEYS.detail(id), 'debts'] as const,
};

/**
 * Récupère le répertoire des clients
 */
export const useClientsListQuery = (params?: ClientQueryParams) => {
  return useQuery({
    queryKey: CLIENT_KEYS.list(params),
    queryFn: () => clientsService.getAll(params),
    staleTime: 1000 * 60 * 3,
  });
};

/**
 * Récupère la fiche détaillée d'un client
 */
export const useClientDetailQuery = (id: string) => {
  return useQuery({
    queryKey: CLIENT_KEYS.detail(id),
    queryFn: () => clientsService.getById(id),
    enabled: Boolean(id),
  });
};

/**
 * Récupère les factures impayées et créances d'un client
 */
export const useClientDebtsQuery = (id: string) => {
  return useQuery({
    queryKey: CLIENT_KEYS.debts(id),
    queryFn: () => clientsService.getDebts(id),
    enabled: Boolean(id),
  });
};

/**
 * Mutation pour créer un nouveau client
 */
export const useCreateClientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClientDto) => clientsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENT_KEYS.lists() });
    },
  });
};

/**
 * Mutation pour modifier un client
 */
export const useUpdateClientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClientDto }) => clientsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CLIENT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: CLIENT_KEYS.detail(variables.id) });
    },
  });
};

/**
 * Mutation pour encaisser un règlement de créance
 */
export const useRecordPaymentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof clientsService.recordPayment>[0]) =>
      clientsService.recordPayment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CLIENT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: CLIENT_KEYS.detail(variables.clientId) });
      queryClient.invalidateQueries({ queryKey: CLIENT_KEYS.debts(variables.clientId) });
      queryClient.invalidateQueries({ queryKey: ANALYTICS_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
};

/**
 * Mutation pour archiver un client (suppression logique : l'historique reste consultable)
 */
export const useArchiveClientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientsService.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENT_KEYS.all });
    },
  });
};
