import axiosInstance from './axiosInstance';
import type { ApiResponse, PagedResult } from '@/types/api.types';
import type { SubscriptionDto, UpdateSubscriptionRequestDto } from '@/types/subscription.types';

export const subscriptionsApi = {
  getMySubscription: async (): Promise<ApiResponse<SubscriptionDto>> => {
    const response = await axiosInstance.get('/Subscription/my-subscription');
    return response.data;
  },

  upgradeToPremium: async (): Promise<ApiResponse<SubscriptionDto>> => {
    const response = await axiosInstance.post('/Subscription/upgrade');
    return response.data;
  },

  cancelSubscription: async (): Promise<ApiResponse<SubscriptionDto>> => {
    const response = await axiosInstance.post('/Subscription/cancel');
    return response.data;
  },

  getAllSubscriptions: async (params?: any): Promise<ApiResponse<PagedResult<SubscriptionDto>>> => {
    const response = await axiosInstance.get('/Subscription', { params });
    return response.data;
  },

  updateSubscription: async (id: number, data: UpdateSubscriptionRequestDto): Promise<ApiResponse<SubscriptionDto>> => {
    const response = await axiosInstance.put(`/Subscription/${id}`, data);
    return response.data;
  }
};
