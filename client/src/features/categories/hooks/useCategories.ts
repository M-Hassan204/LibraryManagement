import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '@/api/categories.api';
import type { CreateCategoryRequestDto, UpdateCategoryRequestDto } from '@/types/category.types';

export const CATEGORIES_QUERY_KEY = 'categories';
export const CATEGORY_QUERY_KEY = 'category';

export function useCategories() {
  return useQuery({
    queryKey: [CATEGORIES_QUERY_KEY],
    queryFn: async () => {
      const response = await categoriesApi.getAll();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch categories');
      }
      return response.data;
    },
  });
}

export function useCategory(id: number, enabled: boolean = true) {
  return useQuery({
    queryKey: [CATEGORY_QUERY_KEY, id],
    queryFn: async () => {
      const response = await categoriesApi.getById(id);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch category');
      }
      return response.data;
    },
    enabled,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCategoryRequestDto) => {
      const response = await categoriesApi.create(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create category');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
    },
  });
}

export function useUpdateCategory(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateCategoryRequestDto) => {
      const response = await categoriesApi.update(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update category');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CATEGORY_QUERY_KEY, id] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await categoriesApi.delete(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete category');
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
    },
  });
}
