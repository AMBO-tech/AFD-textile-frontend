import { useQuery } from '@tanstack/react-query'
import API from '@/services/api'
import type { DashboardKpis } from '@/types/api'

export function useDashboardKpis(locationId?: string) {
  return useQuery<DashboardKpis>({
    queryKey: ['dashboard-kpis', locationId],
    queryFn: async () => {
      const res = await API.get('/analytics/dashboard', { params: { locationId } })
      return res.data?.data || res.data || {
        caJour: 0,
        caSemaine: 0,
        nombreVentes: 0,
        stockTotal: 0,
        creancesTotal: 0,
        alertesCount: 0,
      }
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
  })
}
