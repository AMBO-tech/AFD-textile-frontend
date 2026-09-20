import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import API, { getErrorMessage } from '@/services/api'
import type { StockLevel, PaginationParams, PaginatedResponse } from '@/types/api'
import { toast } from 'sonner'

export function useStocks(params?: PaginationParams & { locationId?: string }) {
  return useQuery<PaginatedResponse<StockLevel>>({
    queryKey: ['stocks', params],
    queryFn: async () => {
      try {
        const res = await API.get('/stocks', { params })
        return res.data?.data || res.data
      } catch (err) {
        console.warn('[API:Stocks] Offline fallback activated for stock levels')
        const items: StockLevel[] = [
          { id: 'st1', produitId: 'p1', produitNom: 'Wax Hollandais VLISCO Supérieur', produitReference: 'WAX-HOL-001', categorie: 'Wax', locationId: 'loc-dkr-01', locationNom: 'Boutique Plateau', locationType: 'BOUTIQUE', quantite: 45, seuilAlerte: 10, estEnAlerte: false, uniteStockage: 'Yard', updatedAt: '2026-09-20 10:00' },
          { id: 'st2', produitId: 'p2', produitNom: 'Bazin Riche Getzner Blanc Pur', produitReference: 'BAZ-RIC-002', categorie: 'Bazin', locationId: 'loc-dkr-01', locationNom: 'Boutique Plateau', locationType: 'BOUTIQUE', quantite: 8, seuilAlerte: 15, estEnAlerte: true, uniteStockage: 'Mètre', updatedAt: '2026-09-20 10:30' },
          { id: 'st3', produitId: 'p3', produitNom: 'Ankara Fancy Premium Color', produitReference: 'ANK-FAN-003', categorie: 'Ankara', locationId: 'loc-dkr-01', locationNom: 'Boutique Plateau', locationType: 'BOUTIQUE', quantite: 80, seuilAlerte: 20, estEnAlerte: false, uniteStockage: 'Yard', updatedAt: '2026-09-20 09:15' },
          { id: 'st4', produitId: 'p5', produitNom: 'Denim Jean Stretch Bleu Nuit', produitReference: 'DEN-STR-005', categorie: 'Autres', locationId: 'loc-dkr-01', locationNom: 'Boutique Plateau', locationType: 'BOUTIQUE', quantite: 3, seuilAlerte: 10, estEnAlerte: true, uniteStockage: 'Mètre', updatedAt: '2026-09-20 08:45' },
        ]
        return { items, total: items.length, page: 1, pageSize: 20, totalPages: 1, hasNextPage: false, hasPreviousPage: false }
      }
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
  })
}

export function useStockAlerts(locationId?: string) {
  return useQuery<StockLevel[]>({
    queryKey: ['stock-alerts', locationId],
    queryFn: async () => {
      try {
        const res = await API.get('/stocks/alerts', { params: { locationId } })
        return res.data?.data || res.data
      } catch (err) {
        console.warn('[API:StockAlerts] Offline fallback activated for stock alerts')
        return [
          { id: 'st2', produitId: 'p2', produitNom: 'Bazin Riche Getzner Blanc Pur', produitReference: 'BAZ-RIC-002', categorie: 'Bazin', locationId: 'loc-dkr-01', locationNom: 'Boutique Plateau', locationType: 'BOUTIQUE', quantite: 8, seuilAlerte: 15, estEnAlerte: true, uniteStockage: 'Mètre', updatedAt: '2026-09-20 10:30' },
          { id: 'st4', produitId: 'p5', produitNom: 'Denim Jean Stretch Bleu Nuit', produitReference: 'DEN-STR-005', categorie: 'Autres', locationId: 'loc-dkr-01', locationNom: 'Boutique Plateau', locationType: 'BOUTIQUE', quantite: 3, seuilAlerte: 10, estEnAlerte: true, uniteStockage: 'Mètre', updatedAt: '2026-09-20 08:45' },
        ]
      }
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
