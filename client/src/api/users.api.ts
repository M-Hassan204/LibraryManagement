import axiosInstance from '@/api/axiosInstance';
import type { ApiResponse } from '@/types/api.types';
import type {
  ChangePasswordRequestDto,
  UpdateProfileRequestDto,
  UserDto,
  AdminUserDto,
  UserResourceParameters,
  UpdateAdminUserRequestDto,
  AssignRoleRequestDto
} from '@/types/user.types';
import type { PagedResult } from '@/types/api.types';

export const usersApi = {
  getProfile(): Promise<ApiResponse<UserDto>> {
    return axiosInstance
      .get<ApiResponse<UserDto>>('/user/me')
      .then((res) => res.data);
  },

  updateProfile(
    data: UpdateProfileRequestDto,
  ): Promise<ApiResponse<UserDto>> {
    return axiosInstance
      .put<ApiResponse<UserDto>>('/user/me', data)
      .then((res) => res.data);
  },

  changePassword(
    data: ChangePasswordRequestDto,
  ): Promise<ApiResponse<boolean>> {
    return axiosInstance
      .post<ApiResponse<boolean>>('/user/me/change-password', data)
      .then((res) => res.data);
  },

  uploadProfileImage(file: File): Promise<ApiResponse<UserDto>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return axiosInstance
      .post<ApiResponse<UserDto>>('/user/me/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => res.data);
  },

  removeProfileImage(): Promise<ApiResponse<UserDto>> {
    return axiosInstance
      .delete<ApiResponse<UserDto>>('/user/me/profile-image')
      .then((res) => res.data);
  },

  // Admin Endpoints
  getUsers: async (
    params: UserResourceParameters
  ): Promise<PagedResult<AdminUserDto>> => {
    const response = await axiosInstance.get<ApiResponse<PagedResult<AdminUserDto>>>(
      '/admin/users',
      { params }
    );
    return response.data.data!;
  },

  getUserById: async (id: string): Promise<AdminUserDto> => {
    const response = await axiosInstance.get<ApiResponse<AdminUserDto>>(
      `/admin/users/${id}`
    );
    return response.data.data!;
  },

  updateUser: async (id: string, data: UpdateAdminUserRequestDto): Promise<AdminUserDto> => {
    const response = await axiosInstance.put<ApiResponse<AdminUserDto>>(
      `/admin/users/${id}`,
      data
    );
    return response.data.data!;
  },

  deleteUser: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/admin/users/${id}`);
  },

  lockUser: async (id: string): Promise<void> => {
    await axiosInstance.post(`/admin/users/${id}/lock`);
  },

  unlockUser: async (id: string): Promise<void> => {
    await axiosInstance.post(`/admin/users/${id}/unlock`);
  },

  activateUser: async (id: string): Promise<void> => {
    await axiosInstance.post(`/admin/users/${id}/activate`);
  },

  deactivateUser: async (id: string): Promise<void> => {
    await axiosInstance.post(`/admin/users/${id}/deactivate`);
  },

  assignRole: async (id: string, data: AssignRoleRequestDto): Promise<void> => {
    await axiosInstance.post(`/admin/users/${id}/roles`, data);
  },

  removeRole: async (id: string, role: string): Promise<void> => {
    await axiosInstance.delete(`/admin/users/${id}/roles/${role}`);
  }
};
