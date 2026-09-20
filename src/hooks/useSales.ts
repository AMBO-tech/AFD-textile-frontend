import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import API, { getErrorMessage } from '@/services/api'
import type { Sale, PaginationParams, PaginatedResponse } from '@/types/api'
import { toast } from 'sonner'

export function useSales(params?: PaginationParams & { boutiqueId?: string }) {
  return useQuery<PaginatedResponse<Sale>>({
    queryKey: ['sales', params],
    queryFn: async () => {
      const res = await API.get('/sales', { params })
      return res.data?.data || res.data || { items: [], total: 0, page: 1, pageSize: 20, totalPages: 0, hasNextPage: false, hasPreviousPage: false }
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
  })
}

export function useCreateSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<Sale>) => {
      const res = await API.post('/sales', payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['stocks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] })
      toast.success('Vente validée et stock réactualisé')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Erreur lors de la vente'))
    },
  })
}

export function useCancelSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, motif }: { id: string; motif: string }) => {
      const res = await API.post(`/sales/${id}/cancel`, { motif })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['stocks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] })
      toast.success('Vente annulée et articles réintégrés')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Impossible d’annuler la vente'))
    },
  })
}
