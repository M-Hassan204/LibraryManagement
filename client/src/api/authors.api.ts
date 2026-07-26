import axiosInstance from '@/api/axiosInstance';
import type { ApiResponse } from '@/types/api.types';
import type {
  AuthorDto,
  CreateAuthorRequestDto,
  UpdateAuthorRequestDto,
} from '@/types/author.types';

export const authorsApi = {
  getAll(): Promise<ApiResponse<AuthorDto[]>> {
    return axiosInstance
      .get<ApiResponse<AuthorDto[]>>('/author')
      .then((res) => res.data);
  },

  getById(id: number): Promise<ApiResponse<AuthorDto>> {
    return axiosInstance
      .get<ApiResponse<AuthorDto>>(`/author/${id}`)
      .then((res) => res.data);
  },

  create(data: CreateAuthorRequestDto): Promise<ApiResponse<AuthorDto>> {
    return axiosInstance
      .post<ApiResponse<AuthorDto>>('/author', data)
      .then((res) => res.data);
  },

  update(
    id: number,
    data: UpdateAuthorRequestDto,
  ): Promise<ApiResponse<AuthorDto>> {
    return axiosInstance
      .put<ApiResponse<AuthorDto>>(`/author/${id}`, data)
      .then((res) => res.data);
  },

  delete(id: number): Promise<ApiResponse<boolean>> {
    return axiosInstance
      .delete<ApiResponse<boolean>>(`/author/${id}`)
      .then((res) => res.data);
  },
};
