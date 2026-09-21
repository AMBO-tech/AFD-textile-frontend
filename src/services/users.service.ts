import { API } from './api';
import type {
  UserItem,
  InviteUserRequest,
  InvitationResponse,
  UpdateUserRequest,
} from '@/types/users';
import type { PaginatedResponse } from '@/types/api';

export const usersService = {
  getAll: async (params?: Record<string, unknown>) => {
    const res = await API.get<PaginatedResponse<UserItem>>('/users', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await API.get<UserItem>(`/users/${id}`);
    return res.data;
  },
  invite: async (data: InviteUserRequest): Promise<InvitationResponse> => {
    const res = await API.post<InvitationResponse>('/users/invite', data);
    return res.data;
  },
  resendInvite: async (id: string): Promise<InvitationResponse> => {
    const res = await API.post<InvitationResponse>(`/users/${id}/resend-invite`);
    return res.data;
  },
  update: async (id: string, data: UpdateUserRequest) => {
    const res = await API.patch<UserItem>(`/users/${id}`, data);
    return res.data;
  },
  toggleStatus: async (id: string) => {
    const res = await API.patch<UserItem>(`/users/${id}/toggle-status`);
    return res.data;
  },
};

export default usersService;
