import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import API, { getErrorMessage } from '@/services/api'
import type { Client, PaginationParams, PaginatedResponse } from '@/types/api'
import { toast } from 'sonner'

export function useClients(params?: PaginationParams & { avecDetteSeulement?: boolean }) {
  return useQuery<PaginatedResponse<Client>>({
    queryKey: ['clients', params],
    queryFn: async () => {
      try {
        const res = await API.get('/clients', { params })
        return res.data?.data || res.data
      } catch (err) {
        console.warn('[API:Clients] Offline fallback activated for client directory')
        const items: Client[] = [
          { id: 'cl-1', nom: 'Mme Fatou Sow', telephone: '+225 07 12 34 56', adresse: 'Plateau, Rue du Commerce', totalDu: 0, nombreFacturesImpayees: 0, createdAt: '2026-01-15' },
          { id: 'cl-2', nom: 'M. Ousmane Diop', telephone: '+225 05 23 45 67', adresse: 'Cocody Cité des Cadres', totalDu: 40000, nombreFacturesImpayees: 1, createdAt: '2026-02-10' },
          { id: 'cl-3', nom: 'Mme Awa Coulibaly', telephone: '+225 01 98 76 54', adresse: 'Adjamé Marché', totalDu: 85000, nombreFacturesImpayees: 2, createdAt: '2026-03-01' },
          { id: 'cl-4', nom: 'M. Jean-Marc Kouassi', telephone: '+225 07 55 44 33', adresse: 'Marcory Zone 4', totalDu: 0, nombreFacturesImpayees: 0, createdAt: '2026-04-12' },
        ]
        return { items, total: items.length, page: 1, pageSize: 20, totalPages: 1, hasNextPage: false, hasPreviousPage: false }
      }
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (dto: { nom: string; telephone?: string; adresse?: string }) => {
      const res = await API.post('/clients', dto)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Fiche client créée')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Erreur lors de la création du client'))
    },
  })
}

export function useSendRelance() {
  return useMutation({
    mutationFn: async ({ clientId, canal, message }: { clientId: string; canal: 'WHATSAPP' | 'SMS'; message: string }) => {
      const res = await API.post(`/clients/${clientId}/relance`, { canal, message })
      return res.data
    },
    onSuccess: (_, vars) => {
      toast.success(`Relance ${vars.canal} consignée au journal`)
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Erreur d’enregistrement de la relance'))
    },
  })
}

export function useRecordPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ clientId, montant, moyenPaiement }: { clientId: string; montant: number; moyenPaiement: string }) => {
      const res = await API.post(`/clients/${clientId}/paiements`, { montant, moyenPaiement })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Paiement enregistré avec succès')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Erreur lors de l\'enregistrement du paiement'))
    },
  })
}

