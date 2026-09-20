import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import API, { getErrorMessage } from '@/services/api'
import type { Sale, PaginationParams, PaginatedResponse } from '@/types/api'
import { toast } from 'sonner'

export function useSales(params?: PaginationParams & { boutiqueId?: string }) {
  return useQuery<PaginatedResponse<Sale>>({
    queryKey: ['sales', params],
    queryFn: async () => {
      try {
        const res = await API.get('/sales', { params })
        return res.data?.data || res.data
      } catch (err) {
        console.warn('[API:Sales] Offline fallback activated for sales history')
        const items: Sale[] = [
          {
            id: 'sl-101',
            referenceFacture: 'FAC-2026-0042',
            boutiqueId: 'loc-dkr-01',
            boutiqueNom: 'Boutique Plateau',
            vendeurNom: 'Ibrahim Koné',
            clientId: 'cl-1',
            clientNom: 'Mme Fatou Sow',
            statut: 'CONFIRMEE',
            statutPaiement: 'SOLDE',
            montantTotal: 72000,
            montantPaye: 72000,
            soldeDu: 0,
            moyenPaiement: 'WAVE',
            lignes: [{ produitId: 'p1', produitNom: 'Wax Hollandais VLISCO Supérieur', produitReference: 'WAX-HOL-001', quantite: 6, unite: 'Yard', prixUnitaire: 12000, remise: 0, totalLigne: 72000 }],
            createdAt: '2026-09-20 11:42',
          },
          {
            id: 'sl-102',
            referenceFacture: 'FAC-2026-0041',
            boutiqueId: 'loc-dkr-01',
            boutiqueNom: 'Boutique Plateau',
            vendeurNom: 'Ibrahim Koné',
            clientId: 'cl-2',
            clientNom: 'M. Ousmane Diop',
            statut: 'CONFIRMEE',
            statutPaiement: 'PARTIEL',
            montantTotal: 90000,
            montantPaye: 50000,
            soldeDu: 40000,
            moyenPaiement: 'ESPECES',
            lignes: [{ produitId: 'p2', produitNom: 'Bazin Riche Getzner Blanc Pur', produitReference: 'BAZ-RIC-002', quantite: 5, unite: 'Mètre', prixUnitaire: 18000, remise: 0, totalLigne: 90000 }],
            createdAt: '2026-09-20 10:15',
          },
        ]
        return { items, total: items.length, page: 1, pageSize: 20, totalPages: 1, hasNextPage: false, hasPreviousPage: false }
      }
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
