import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '@/api/subscriptions.api';
import { UpdateSubscriptionRequestDto } from '@/types/subscription.types';

export const useAdminSubscriptions = (params?: any) => {
  return useQuery({
    queryKey: ['admin_subscriptions', params],
    queryFn: () => subscriptionsApi.getAllSubscriptions(params),
  });
};

export const useAdminUpdateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: UpdateSubscriptionRequestDto }) => subscriptionsApi.updateSubscription(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_subscriptions'] });
    },
  });
};
