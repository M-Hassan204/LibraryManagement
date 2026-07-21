import axiosInstance from '@/api/axiosInstance';
import type { ApiResponse } from '@/types/api.types';
import type { DashboardStatsDto } from '@/types/dashboard.types';

export const dashboardApi = {
  getStatistics(): Promise<ApiResponse<DashboardStatsDto>> {
    return axiosInstance
      .get<ApiResponse<DashboardStatsDto>>('/dashboard/statistics')
      .then((res) => res.data);
  },
};
