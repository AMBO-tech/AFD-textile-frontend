import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boutiquesService } from '../../services/boutiques.service';
import type { CreateLocationDto, UpdateLocationDto } from '../../types/locations';

export const LOCATION_KEYS = {
  all: ['locations'] as const,
  lists: () => [...LOCATION_KEYS.all, 'list'] as const,
  list: (params?: Record<string, unknown>) => [...LOCATION_KEYS.lists(), params] as const,
  details: () => [...LOCATION_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...LOCATION_KEYS.details(), id] as const,
};

/**
 * Récupère la liste des boutiques et entrepôts
 */
export const useLocationsListQuery = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: LOCATION_KEYS.list(params),
    queryFn: () => boutiquesService.getAll(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Récupère le détail d'une boutique
 */
export const useLocationDetailQuery = (id: string) => {
  return useQuery({
    queryKey: LOCATION_KEYS.detail(id),
    queryFn: () => boutiquesService.getById(id),
    enabled: Boolean(id),
  });
};

/**
 * Mutation pour créer une nouvelle boutique
 */
export const useCreateLocationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLocationDto) => boutiquesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCATION_KEYS.lists() });
    },
  });
};

/**
 * Mutation pour mettre à jour une boutique
 */
export const useUpdateLocationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLocationDto }) => boutiquesService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: LOCATION_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: LOCATION_KEYS.detail(variables.id) });
    },
  });
};

/**
 * Mutation pour activer / désactiver une boutique
 */
export const useToggleLocationStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => boutiquesService.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCATION_KEYS.lists() });
    },
  });
};
