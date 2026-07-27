import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '@/api/subscriptions.api';

export const useSubscription = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['subscription', userId],
    queryFn: () => subscriptionsApi.getMySubscription(),
    enabled: !!userId,
  });
};

export const useUpgradeSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => subscriptionsApi.upgradeToPremium(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => subscriptionsApi.cancelSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
};
