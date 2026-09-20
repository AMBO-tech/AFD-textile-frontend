import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import API, { getErrorMessage } from '@/api/api'
import type { Produit, CreateProduitDto, UpdateProduitDto, ProductQueryParams } from '@/types/products'
import type { PaginatedResponse } from '@/types/api'
import { toast } from 'sonner'

export function useProducts(params?: ProductQueryParams) {
  return useQuery<PaginatedResponse<Produit>>({
    queryKey: ['products', params],
    queryFn: async () => {
      const response = await API.get('/products', { params })
      return response.data?.data || response.data || { items: [], total: 0, page: 1, pageSize: 20, totalPages: 0, hasNextPage: false, hasPreviousPage: false }
    },
    retry: 1,
    staleTime: 1000 * 60 * 2,
  })
}

export function useProduct(id?: string) {
  return useQuery<Produit>({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) throw new Error('Identifiant produit manquant')
      const response = await API.get(`/products/${id}`)
      return response.data?.data || response.data
    },
    enabled: Boolean(id),
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (dto: CreateProduitDto) => {
      const response = await API.post('/products', dto)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produit enregistré avec succès')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Échec de l'ajout du produit"))
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateProduitDto }) => {
      const response = await API.put(`/products/${id}`, dto)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] })
      toast.success('Produit modifié avec succès')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Échec de la modification du produit'))
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await API.delete(`/products/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produit supprimé')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Impossible de supprimer le produit'))
    },
  })
}
