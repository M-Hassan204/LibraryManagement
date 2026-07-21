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
      .get<ApiResponse<AuthorDto[]>>('/authors')
      .then((res) => res.data);
  },

  getById(id: number): Promise<ApiResponse<AuthorDto>> {
    return axiosInstance
      .get<ApiResponse<AuthorDto>>(`/authors/${id}`)
      .then((res) => res.data);
  },

  create(data: CreateAuthorRequestDto): Promise<ApiResponse<AuthorDto>> {
    return axiosInstance
      .post<ApiResponse<AuthorDto>>('/authors', data)
      .then((res) => res.data);
  },

  update(
    id: number,
    data: UpdateAuthorRequestDto,
  ): Promise<ApiResponse<AuthorDto>> {
    return axiosInstance
      .put<ApiResponse<AuthorDto>>(`/authors/${id}`, data)
      .then((res) => res.data);
  },

  delete(id: number): Promise<ApiResponse<boolean>> {
    return axiosInstance
      .delete<ApiResponse<boolean>>(`/authors/${id}`)
      .then((res) => res.data);
  },
};
