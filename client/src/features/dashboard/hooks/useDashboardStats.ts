import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/dashboard.api';
import type { DashboardStatsDto } from '@/types/dashboard.types';

export const DASHBOARD_STATS_QUERY_KEY = ['dashboardStats'];

export function useDashboardStats() {
  return useQuery<DashboardStatsDto, Error>({
    queryKey: DASHBOARD_STATS_QUERY_KEY,
    queryFn: async () => {
      // dashboardApi.getStatistics returns ApiResponse<DashboardStatsDto> directly?
      // Wait, let's verify what `getStatistics` returns. It returns `res.data` which is `ApiResponse<DashboardStatsDto>`.
      // So we need to unpack it here, or perhaps the interceptor does it?
      // Wait, dashboardApi.getStatistics is typed to return Promise<ApiResponse<DashboardStatsDto>>.
      const response = await dashboardApi.getStatistics();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch dashboard statistics');
      }
      return response.data;
    },
  });
}
