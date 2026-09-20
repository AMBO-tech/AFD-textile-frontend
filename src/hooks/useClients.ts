import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import API, { getErrorMessage } from '@/services/api'
import type { Client, PaginationParams, PaginatedResponse } from '@/types/api'
import { toast } from 'sonner'

export function useClients(params?: PaginationParams & { avecDetteSeulement?: boolean }) {
  return useQuery<PaginatedResponse<Client>>({
    queryKey: ['clients', params],
    queryFn: async () => {
      const res = await API.get('/clients', { params })
      return res.data?.data || res.data || { items: [], total: 0, page: 1, pageSize: 20, totalPages: 0, hasNextPage: false, hasPreviousPage: false }
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (dto: { nom: string; telephone?: string; adresse?: string }) => {
      const res = await API.post('/clients', dto)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Fiche client créée')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Erreur lors de la création du client'))
    },
  })
}

export function useSendRelance() {
  return useMutation({
    mutationFn: async ({ clientId, canal, message }: { clientId: string; canal: 'WHATSAPP' | 'SMS'; message: string }) => {
      const res = await API.post(`/clients/${clientId}/relance`, { canal, message })
      return res.data
    },
    onSuccess: (_, vars) => {
      toast.success(`Relance ${vars.canal} consignée au journal`)
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Erreur d’enregistrement de la relance'))
    },
  })
}
