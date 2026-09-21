import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../../services/users.service';
import type { InviteUserRequest, UpdateUserRequest } from '@/types/users';

export const USER_KEYS = {
  all: ['users'] as const,
  lists: () => [...USER_KEYS.all, 'list'] as const,
  list: (params?: Record<string, unknown>) => [...USER_KEYS.lists(), params] as const,
  details: () => [...USER_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...USER_KEYS.details(), id] as const,
};

/**
 * Récupère la liste des utilisateurs
 */
export const useUsersListQuery = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: USER_KEYS.list(params),
    queryFn: () => usersService.getAll(params),
    staleTime: 1000 * 60 * 3,
  });
};

/**
 * Mutation pour inviter un collaborateur (génère le jeton 72h et déclenche SMS/Email)
 */
export const useInviteUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InviteUserRequest) => usersService.invite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.lists() });
    },
  });
};

/**
 * Mutation pour réexpédier l'invitation
 */
export const useResendInviteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.resendInvite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.lists() });
    },
  });
};

/**
 * Mutation pour modifier un utilisateur
 */
export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      usersService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: USER_KEYS.detail(variables.id) });
    },
  });
};

/**
 * Mutation pour basculer le statut actif/inactif
 */
export const useToggleUserStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.lists() });
    },
  });
};
