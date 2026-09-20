import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import API, { getErrorMessage } from '@/api/api'
import type { StockLevel, AdjustStockDto, ExecuteMovementDto, StockQueryParams } from '@/types/stocks'
import type { PaginatedResponse } from '@/types/api'
import { toast } from 'sonner'

export function useStocks(params?: StockQueryParams) {
  return useQuery<PaginatedResponse<StockLevel>>({
    queryKey: ['stocks', params],
    queryFn: async () => {
      const response = await API.get('/stocks', { params })
      return response.data?.data || response.data || { items: [], total: 0, page: 1, pageSize: 20, totalPages: 0, hasNextPage: false, hasPreviousPage: false }
    },
    retry: 1,
    staleTime: 1000 * 60 * 2,
  })
}

export function useStockAlerts(locationId?: string) {
  return useQuery<StockLevel[]>({
    queryKey: ['stock-alerts', locationId],
    queryFn: async () => {
      const response = await API.get('/stocks/alerts', { params: { locationId } })
      return response.data?.data || response.data || []
    },
    retry: 1,
  })
}

export function useAdjustStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (dto: AdjustStockDto) => {
      const response = await API.post('/stocks/ajustement', dto)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stocks'] })
      queryClient.invalidateQueries({ queryKey: ['stock-alerts'] })
      toast.success('Stock ajusté avec succès')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Échec de l'ajustement du stock"))
    },
  })
}

export function useExecuteStockMovement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (dto: ExecuteMovementDto) => {
      const response = await API.post('/stocks/mouvements', dto)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stocks'] })
      queryClient.invalidateQueries({ queryKey: ['stock-alerts'] })
      toast.success('Mouvement de stock validé')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Impossible d’enregistrer le mouvement'))
    },
  })
}
