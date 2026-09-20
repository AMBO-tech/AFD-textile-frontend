import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import API, { getErrorMessage } from '@/api/api'
import type { Client, CreateClientDto, UpdateClientDto, ClientQueryParams, ClientDebtsStatementDto } from '@/types/clients'
import type { PaginatedResponse } from '@/types/api'
import { toast } from 'sonner'

export function useClients(params?: ClientQueryParams) {
  return useQuery<PaginatedResponse<Client>>({
    queryKey: ['clients', params],
    queryFn: async () => {
      const response = await API.get('/clients', { params })
      return response.data?.data || response.data || { items: [], total: 0, page: 1, pageSize: 20, totalPages: 0, hasNextPage: false, hasPreviousPage: false }
    },
    retry: 1,
    staleTime: 1000 * 60 * 2,
  })
}

export function useClientDebtsStatement(clientId?: string) {
  return useQuery<ClientDebtsStatementDto>({
    queryKey: ['client-debts', clientId],
    queryFn: async () => {
      if (!clientId) throw new Error('Identifiant client manquant')
      const response = await API.get(`/clients/${clientId}/debts`)
      return response.data?.data || response.data
    },
    enabled: Boolean(clientId),
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (dto: CreateClientDto) => {
      const response = await API.post('/clients', dto)
      return response.data?.data || response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Client enregistré avec succès')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Échec de l'ajout du client"))
    },
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateClientDto }) => {
      const response = await API.put(`/clients/${id}`, dto)
      return response.data?.data || response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Fiche client mise à jour')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Impossible de modifier le client'))
    },
  })
}

export function useSendRelance() {
  return useMutation({
    mutationFn: async ({ clientId, canal, message }: { clientId: string; canal: 'WHATSAPP' | 'SMS'; message: string }) => {
      const response = await API.post(`/clients/${clientId}/relance`, { canal, message })
      return response.data
    },
    onSuccess: (_, variables) => {
      toast.success(`Relance ${variables.canal} enregistrée`)
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erreur lors de la relance'))
    },
  })
}
