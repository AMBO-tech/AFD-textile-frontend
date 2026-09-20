import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import API, { getErrorMessage } from '@/api/api'
import type { Vente, CreateSaleDto, CancelSaleDto, SaleQueryParams, SyncOfflineSalesResponse } from '@/types/sales'
import type { PaginatedResponse } from '@/types/api'
import { toast } from 'sonner'

export function useSales(params?: SaleQueryParams) {
  return useQuery<PaginatedResponse<Vente>>({
    queryKey: ['sales', params],
    queryFn: async () => {
      const response = await API.get('/sales', { params })
      return response.data?.data || response.data || { items: [], total: 0, page: 1, pageSize: 20, totalPages: 0, hasNextPage: false, hasPreviousPage: false }
    },
    retry: 1,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (dto: CreateSaleDto) => {
      const response = await API.post('/sales', dto)
      return response.data?.data || response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['stocks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Vente enregistrée avec succès')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Échec de l'enregistrement de la vente"))
    },
  })
}

export function useCancelSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: CancelSaleDto }) => {
      const response = await API.post(`/sales/${id}/cancel`, dto)
      return response.data?.data || response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['stocks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Vente annulée et stock réintégré')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Impossible d'annuler la vente"))
    },
  })
}

export function useSyncOfflineSales() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (offlineSales: CreateSaleDto[]) => {
      const response = await API.post<SyncOfflineSalesResponse>('/sales/sync', { sales: offlineSales })
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['stocks'] })
      toast.success(`Synchronisation terminée (${data.reussies} réussies, ${data.echecs} échecs)`)
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Échec de synchronisation'))
    },
  })
}
