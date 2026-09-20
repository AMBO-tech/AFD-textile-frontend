import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import API, { getErrorMessage } from '@/api/api'
import type { Location, CreateLocationDto, UpdateLocationDto } from '@/types/locations'
import { toast } from 'sonner'

export function useLocations() {
  return useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      const response = await API.get('/locations')
      return response.data?.data || response.data || []
    },
    retry: 1,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateLocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (dto: CreateLocationDto) => {
      const response = await API.post('/locations', dto)
      return response.data?.data || response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      toast.success('Emplacement configuré avec succès')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Échec de l'ajout de l'emplacement"))
    },
  })
}

export function useUpdateLocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateLocationDto }) => {
      const response = await API.put(`/locations/${id}`, dto)
      return response.data?.data || response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      toast.success('Emplacement mis à jour')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Impossible de modifier cet emplacement'))
    },
  })
}
