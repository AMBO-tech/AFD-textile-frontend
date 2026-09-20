import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import API, { getErrorMessage } from '@/services/api'
import type { Product, PaginationParams, PaginatedResponse } from '@/types/api'
import { toast } from 'sonner'

export function useProducts(params?: PaginationParams) {
  return useQuery<PaginatedResponse<Product>>({
    queryKey: ['products', params],
    queryFn: async () => {
      const res = await API.get('/products', { params })
      return res.data?.data || res.data || { items: [], total: 0, page: 1, pageSize: 20, totalPages: 0, hasNextPage: false, hasPreviousPage: false }
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (dto: Partial<Product>) => {
      const res = await API.post('/products', dto)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Tissu enregistré au catalogue')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Erreur lors de l’enregistrement'))
    },
  })
}
