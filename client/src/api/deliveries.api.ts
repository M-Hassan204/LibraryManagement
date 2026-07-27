import axiosInstance from './axiosInstance';
import type { ApiResponse } from '@/types/api.types';
import type { DeliveryRequestDto, UpdateDeliveryStatusDto } from '@/types/delivery.types';

export const deliveriesApi = {
  getPendingDeliveries: async (): Promise<ApiResponse<DeliveryRequestDto[]>> => {
    const response = await axiosInstance.get('/Deliveries/pending');
    return response.data;
  },

  updateDeliveryStatus: async (id: number, data: UpdateDeliveryStatusDto): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.put(`/Deliveries/${id}/status`, data);
    return response.data;
  },
};
