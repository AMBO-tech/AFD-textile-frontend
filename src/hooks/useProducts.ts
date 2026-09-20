import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import API, { getErrorMessage } from '@/services/api'
import type { Product, PaginationParams, PaginatedResponse } from '@/types/api'
import { toast } from 'sonner'

export function useProducts(params?: PaginationParams) {
  return useQuery<PaginatedResponse<Product>>({
    queryKey: ['products', params],
    queryFn: async () => {
      try {
        const res = await API.get('/products', { params })
        return res.data?.data || res.data
      } catch (err) {
        console.warn('[API:Products] Offline fallback activated for products catalog')
        const items: Product[] = [
          { id: 'p1', reference: 'WAX-HOL-001', nom: 'Wax Hollandais VLISCO Supérieur', categorie: 'Wax', prixVente: 12000, prixMinimum: 10000, quantite: 45, unite: 'Yard', actif: true, seuilAlerte: 10 },
          { id: 'p2', reference: 'BAZ-RIC-002', nom: 'Bazin Riche Getzner Blanc Pur', categorie: 'Bazin', prixVente: 18000, prixMinimum: 15000, quantite: 8, unite: 'Mètre', actif: true, seuilAlerte: 15 },
          { id: 'p3', reference: 'ANK-FAN-003', nom: 'Ankara Fancy Premium Color', categorie: 'Ankara', prixVente: 8500, prixMinimum: 7000, quantite: 80, unite: 'Yard', actif: true, seuilAlerte: 20 },
          { id: 'p4', reference: 'SAT-SOI-004', nom: 'Satin Soie de Lyon Imprimé', categorie: 'Satin', prixVente: 15000, prixMinimum: 13000, quantite: 25, unite: 'Mètre', actif: true, seuilAlerte: 10 },
          { id: 'p5', reference: 'DEN-STR-005', nom: 'Denim Jean Stretch Bleu Nuit', categorie: 'Autres', prixVente: 9000, prixMinimum: 7500, quantite: 3, unite: 'Mètre', actif: true, seuilAlerte: 10 },
        ]
        return { items, total: items.length, page: 1, pageSize: 20, totalPages: 1, hasNextPage: false, hasPreviousPage: false }
      }
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
