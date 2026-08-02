import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveriesApi } from '@/api/deliveries.api';
import type { UpdateDeliveryStatusDto } from '@/types/delivery.types';

export const PENDING_DELIVERIES_QUERY_KEY = 'pendingDeliveries';

export function usePendingDeliveries() {
  return useQuery({
    queryKey: [PENDING_DELIVERIES_QUERY_KEY],
    queryFn: async () => {
      const response = await deliveriesApi.getPendingDeliveries();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch pending deliveries');
      }
      return response.data;
    },
  });
}

export function useUpdateDeliveryStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateDeliveryStatusDto }) => {
      const response = await deliveriesApi.updateDeliveryStatus(id, data);
      if (!response.success) {
        throw new Error(response.message || 'Failed to update delivery status');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PENDING_DELIVERIES_QUERY_KEY] });
    },
  });
}
