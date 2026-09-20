import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import API, { getErrorMessage } from '@/api/api'
import type { Transfert, CreateTransfertDto } from '@/types/stocks'
import type { PaginatedResponse } from '@/types/api'
import { toast } from 'sonner'

export function useDemandes(params?: { statut?: string; locationId?: string }) {
  return useQuery<PaginatedResponse<Transfert>>({
    queryKey: ['demandes', params],
    queryFn: async () => {
      const response = await API.get('/transferts', { params })
      return response.data?.data || response.data || { items: [], total: 0, page: 1, pageSize: 20, totalPages: 0, hasNextPage: false, hasPreviousPage: false }
    },
    retry: 1,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateDemande() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (dto: CreateTransfertDto) => {
      const response = await API.post('/transferts', dto)
      return response.data?.data || response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demandes'] })
      toast.success('Demande de transfert transmise')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Impossible de soumettre la demande'))
    },
  })
}

export function useValidateDemande() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, action, quantiteAjustee, motif }: { id: string; action: 'VALIDER' | 'REFUSER'; quantiteAjustee?: number; motif?: string }) => {
      const response = await API.post(`/transferts/${id}/${action === 'VALIDER' ? 'valider' : 'refuser'}`, {
        quantiteAjustee,
        motif,
      })
      return response.data?.data || response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['demandes'] })
      queryClient.invalidateQueries({ queryKey: ['stocks'] })
      toast.success(variables.action === 'VALIDER' ? 'Demande validée et stocks ajustés' : 'Demande refusée')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erreur lors du traitement de la demande'))
    },
  })
}
