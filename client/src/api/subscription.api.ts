import axiosInstance from '@/api/axiosInstance';
import type { ApiResponse, PagedResult, ResourceParameters } from '@/types/api.types';
import type {
  SubscriptionDto,
  UpdateSubscriptionRequestDto,
} from '@/types/subscription.types';

export const subscriptionApi = {
  getMySubscription(): Promise<ApiResponse<SubscriptionDto>> {
    return axiosInstance
      .get<ApiResponse<SubscriptionDto>>('/subscription/my-subscription')
      .then((res) => res.data);
  },

  upgradeToPremium(): Promise<ApiResponse<SubscriptionDto>> {
    return axiosInstance
      .post<ApiResponse<SubscriptionDto>>('/subscription/upgrade')
      .then((res) => res.data);
  },

  cancelSubscription(): Promise<ApiResponse<SubscriptionDto>> {
    return axiosInstance
      .post<ApiResponse<SubscriptionDto>>('/subscription/cancel')
      .then((res) => res.data);
  },

  getAll(params: ResourceParameters): Promise<ApiResponse<PagedResult<SubscriptionDto>>> {
    return axiosInstance
      .get<ApiResponse<PagedResult<SubscriptionDto>>>('/subscription', { params })
      .then((res) => res.data);
  },

  update(id: number, data: UpdateSubscriptionRequestDto): Promise<ApiResponse<SubscriptionDto>> {
    return axiosInstance
      .put<ApiResponse<SubscriptionDto>>(`/subscription/${id}`, data)
      .then((res) => res.data);
  },
};
