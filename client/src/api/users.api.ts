import axiosInstance from '@/api/axiosInstance';
import type { ApiResponse } from '@/types/api.types';
import type {
  ChangePasswordRequestDto,
  UpdateProfileRequestDto,
  UserDto,
} from '@/types/user.types';

export const usersApi = {
  getProfile(): Promise<ApiResponse<UserDto>> {
    return axiosInstance
      .get<ApiResponse<UserDto>>('/users/me')
      .then((res) => res.data);
  },

  updateProfile(
    data: UpdateProfileRequestDto,
  ): Promise<ApiResponse<UserDto>> {
    return axiosInstance
      .put<ApiResponse<UserDto>>('/users/me', data)
      .then((res) => res.data);
  },

  changePassword(
    data: ChangePasswordRequestDto,
  ): Promise<ApiResponse<boolean>> {
    return axiosInstance
      .post<ApiResponse<boolean>>('/users/me/change-password', data)
      .then((res) => res.data);
  },
};
