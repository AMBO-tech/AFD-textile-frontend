import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import API, { getErrorMessage } from '@/services/api'
import type { StockLevel, PaginationParams, PaginatedResponse } from '@/types/api'
import { toast } from 'sonner'

export function useStocks(params?: PaginationParams & { locationId?: string }) {
  return useQuery<PaginatedResponse<StockLevel>>({
    queryKey: ['stocks', params],
    queryFn: async () => {
      const res = await API.get('/stocks', { params })
      return res.data?.data || res.data || { items: [], total: 0, page: 1, pageSize: 20, totalPages: 0, hasNextPage: false, hasPreviousPage: false }
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
  })
}

export function useStockAlerts(locationId?: string) {
  return useQuery<StockLevel[]>({
    queryKey: ['stock-alerts', locationId],
    queryFn: async () => {
      const res = await API.get('/stocks/alerts', { params: { locationId } })
      return res.data?.data || res.data || []
    },
    retry: 1,
  })
}

export function useAdjustStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (dto: { produitId: string; locationId: string; quantite: number; motif: string }) => {
      const res = await API.post('/stocks/ajustement', dto)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stocks'] })
      queryClient.invalidateQueries({ queryKey: ['stock-alerts'] })
      toast.success('Stock corrigé avec succès')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Échec de l’ajustement'))
    },
  })
}
