import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveriesApi } from '@/api/deliveries.api';
import type { UpdateDeliveryStatusDto } from '@/types/delivery.types';

export const usePendingDeliveries = () => {
  return useQuery({
    queryKey: ['deliveries', 'pending'],
    queryFn: deliveriesApi.getPendingDeliveries,
  });
};

export const useUpdateDeliveryStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDeliveryStatusDto }) => 
      deliveriesApi.updateDeliveryStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
    },
  });
};
