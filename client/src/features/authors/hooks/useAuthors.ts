import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authorsApi } from '@/api/authors.api';
import type { CreateAuthorRequestDto, UpdateAuthorRequestDto } from '@/types/author.types';

export const AUTHORS_QUERY_KEY = 'authors';
export const AUTHOR_QUERY_KEY = 'author';

export function useAuthors() {
  return useQuery({
    queryKey: [AUTHORS_QUERY_KEY],
    queryFn: async () => {
      const response = await authorsApi.getAll();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch authors');
      }
      return response.data;
    },
  });
}

export function useAuthor(id: number, enabled: boolean = true) {
  return useQuery({
    queryKey: [AUTHOR_QUERY_KEY, id],
    queryFn: async () => {
      const response = await authorsApi.getById(id);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch author');
      }
      return response.data;
    },
    enabled,
  });
}

export function useCreateAuthor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAuthorRequestDto) => {
      const response = await authorsApi.create(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create author');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUTHORS_QUERY_KEY] });
    },
  });
}

export function useUpdateAuthor(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateAuthorRequestDto) => {
      const response = await authorsApi.update(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update author');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUTHORS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [AUTHOR_QUERY_KEY, id] });
    },
  });
}

export function useDeleteAuthor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await authorsApi.delete(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete author');
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUTHORS_QUERY_KEY] });
    },
  });
}
