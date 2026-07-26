import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api/users.api';
import type { UpdateProfileRequestDto, ChangePasswordRequestDto } from '@/types/user.types';

const PROFILE_QUERY_KEY = ['profile'];

export function useProfile() {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => usersApi.getProfile(),
    staleTime: 5 * 60 * 1000,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileRequestDto) => usersApi.updateProfile(data),
    onSuccess: () => {
      // Invalidate the query to fetch fresh data
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      // If we had a mechanism to update the auth context user, we would do it here. 
      // A full page reload or token refresh usually handles this.
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordRequestDto) => usersApi.changePassword(data),
  });

  const uploadProfileImageMutation = useMutation({
    mutationFn: (file: File) => usersApi.uploadProfileImage(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });

  const removeProfileImageMutation = useMutation({
    mutationFn: () => usersApi.removeProfileImage(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });

  return {
    profile: profileQuery.data?.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
    uploadProfileImage: uploadProfileImageMutation.mutateAsync,
    isUploadingProfileImage: uploadProfileImageMutation.isPending,
    removeProfileImage: removeProfileImageMutation.mutateAsync,
    isRemovingProfileImage: removeProfileImageMutation.isPending,
  };
}
