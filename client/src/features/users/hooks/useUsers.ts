import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api/users.api';
import { userKeys } from '@/constants/queryKeys';
import type { 
  UserResourceParameters, 
  UpdateAdminUserRequestDto, 
  AssignRoleRequestDto 
} from '@/types/user.types';

export function useAdminUsers(params: UserResourceParameters) {
  return useQuery({
    queryKey: userKeys.adminList(params),
    queryFn: () => usersApi.getUsers(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: userKeys.adminDetail(id),
    queryFn: () => usersApi.getUserById(id),
    enabled: !!id,
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAdminUserRequestDto }) =>
      usersApi.updateUser(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.adminLists() });
      queryClient.invalidateQueries({ queryKey: userKeys.adminDetail(data.id) });
    },
    onError: (error: any) => {
      console.error(error);
    },
  });
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.adminLists() });
    },
    onError: (error: any) => {
      console.error(error);
    },
  });
}

export function useLockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.lockUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.adminLists() });
      queryClient.invalidateQueries({ queryKey: userKeys.adminDetail(id) });
    },
    onError: (error: any) => {
      console.error(error);
    },
  });
}

export function useUnlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.unlockUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.adminLists() });
      queryClient.invalidateQueries({ queryKey: userKeys.adminDetail(id) });
    },
    onError: (error: any) => {
      console.error(error);
    },
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.activateUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.adminLists() });
      queryClient.invalidateQueries({ queryKey: userKeys.adminDetail(id) });
    },
    onError: (error: any) => {
      console.error(error);
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.deactivateUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.adminLists() });
      queryClient.invalidateQueries({ queryKey: userKeys.adminDetail(id) });
    },
    onError: (error: any) => {
      console.error(error);
    },
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignRoleRequestDto }) =>
      usersApi.assignRole(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.adminLists() });
      queryClient.invalidateQueries({ queryKey: userKeys.adminDetail(variables.id) });
    },
    onError: (error: any) => {
      console.error(error);
    },
  });
}

export function useRemoveRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      usersApi.removeRole(id, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.adminLists() });
      queryClient.invalidateQueries({ queryKey: userKeys.adminDetail(variables.id) });
    },
    onError: (error: any) => {
      console.error(error);
    },
  });
}
