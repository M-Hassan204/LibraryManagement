import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/api/users.api';
import type { UserResourceParameters } from '@/types/user.types';

export const ADMIN_USERS_QUERY_KEY = 'adminUsers';

export function useAdminUsers(params: UserResourceParameters = {}) {
  return useQuery({
    queryKey: [ADMIN_USERS_QUERY_KEY, params],
    queryFn: async () => {
      const response = await usersApi.getUsers(params);
      return response;
    },
  });
}
