import { useQuery } from '@tanstack/react-query'
import API from '@/api/api'
import type {
  DashboardKpiResponseDto,
  SalesTrendItem,
  StorePerformanceItem,
  TopProductPerformanceItem,
  StockHealthSummary,
  AnalyticsQueryParams,
} from '@/types/analytics'

export function useDashboardKpis(params?: AnalyticsQueryParams) {
  return useQuery<DashboardKpiResponseDto>({
    queryKey: ['dashboard-kpis', params],
    queryFn: async () => {
      const response = await API.get('/analytics/dashboard', { params })
      return response.data?.data || response.data
    },
    retry: 1,
    staleTime: 1000 * 60 * 2,
  })
}

export function useSalesTrends(params?: AnalyticsQueryParams) {
  return useQuery<SalesTrendItem[]>({
    queryKey: ['sales-trends', params],
    queryFn: async () => {
      const response = await API.get('/analytics/trends', { params })
      return response.data?.data || response.data || []
    },
    retry: 1,
    staleTime: 1000 * 60 * 5,
  })
}

export function useStoresPerformance(params?: AnalyticsQueryParams) {
  return useQuery<StorePerformanceItem[]>({
    queryKey: ['stores-performance', params],
    queryFn: async () => {
      const response = await API.get('/analytics/stores', { params })
      return response.data?.data || response.data || []
    },
    retry: 1,
    staleTime: 1000 * 60 * 5,
  })
}

export function useTopProducts(params?: AnalyticsQueryParams) {
  return useQuery<TopProductPerformanceItem[]>({
    queryKey: ['top-products', params],
    queryFn: async () => {
      const response = await API.get('/analytics/top-products', { params })
      return response.data?.data || response.data || []
    },
    retry: 1,
    staleTime: 1000 * 60 * 5,
  })
}

export function useStockHealth(params?: AnalyticsQueryParams) {
  return useQuery<StockHealthSummary>({
    queryKey: ['stock-health', params],
    queryFn: async () => {
      const response = await API.get('/analytics/stock-health', { params })
      return response.data?.data || response.data
    },
    retry: 1,
  })
}
