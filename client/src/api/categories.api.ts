import axiosInstance from '@/api/axiosInstance';
import type { ApiResponse } from '@/types/api.types';
import type {
  CategoryDto,
  CreateCategoryRequestDto,
  UpdateCategoryRequestDto,
} from '@/types/category.types';

export const categoriesApi = {
  getAll(): Promise<ApiResponse<CategoryDto[]>> {
    return axiosInstance
      .get<ApiResponse<CategoryDto[]>>('/categories')
      .then((res) => res.data);
  },

  getById(id: number): Promise<ApiResponse<CategoryDto>> {
    return axiosInstance
      .get<ApiResponse<CategoryDto>>(`/categories/${id}`)
      .then((res) => res.data);
  },

  create(data: CreateCategoryRequestDto): Promise<ApiResponse<CategoryDto>> {
    return axiosInstance
      .post<ApiResponse<CategoryDto>>('/categories', data)
      .then((res) => res.data);
  },

  update(
    id: number,
    data: UpdateCategoryRequestDto,
  ): Promise<ApiResponse<CategoryDto>> {
    return axiosInstance
      .put<ApiResponse<CategoryDto>>(`/categories/${id}`, data)
      .then((res) => res.data);
  },

  delete(id: number): Promise<ApiResponse<boolean>> {
    return axiosInstance
      .delete<ApiResponse<boolean>>(`/categories/${id}`)
      .then((res) => res.data);
  },
};
