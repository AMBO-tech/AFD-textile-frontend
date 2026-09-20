import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import API, { getErrorMessage } from '@/services/api'
import type { Transfert, PaginationParams, PaginatedResponse } from '@/types/api'
import { toast } from 'sonner'

export function useTransferts(params?: PaginationParams & { locationId?: string }) {
  return useQuery<PaginatedResponse<Transfert>>({
    queryKey: ['transferts', params],
    queryFn: async () => {
      const res = await API.get('/transferts', { params })
      return res.data?.data || res.data || { items: [], total: 0, page: 1, pageSize: 20, totalPages: 0, hasNextPage: false, hasPreviousPage: false }
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
  })
}

export function useCreateTransfert() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (dto: Partial<Transfert>) => {
      const res = await API.post('/transferts', dto)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transferts'] })
      toast.success('Demande de transfert enregistrée')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Erreur lors de la demande de transfert'))
    },
  })
}

export function useValidateTransfert() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, action, motif }: { id: string; action: 'ACCEPTER' | 'REFUSER'; motif?: string }) => {
      const res = await API.post(`/transferts/${id}/${action.toLowerCase()}`, { motif })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transferts'] })
      queryClient.invalidateQueries({ queryKey: ['stocks'] })
      toast.success('Statut du transfert mis à jour')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Impossible de traiter le transfert'))
    },
  })
}
