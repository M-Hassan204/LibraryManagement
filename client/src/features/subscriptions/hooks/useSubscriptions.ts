import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionApi } from '@/api/subscription.api';
import type { ResourceParameters } from '@/types/api.types';
import type { UpdateSubscriptionRequestDto } from '@/types/subscription.types';

export function useMySubscription() {
  return useQuery({
    queryKey: ['my-subscription'],
    queryFn: () => subscriptionApi.getMySubscription(),
  });
}

export function useUpgradeSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => subscriptionApi.upgradeToPremium(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-subscription'] });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => subscriptionApi.cancelSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-subscription'] });
    },
  });
}

export function useSubscriptions(params: ResourceParameters) {
  return useQuery({
    queryKey: ['subscriptions', params],
    queryFn: () => subscriptionApi.getAll(params),
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateSubscriptionRequestDto) => subscriptionApi.update(data.subscriptionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
}
