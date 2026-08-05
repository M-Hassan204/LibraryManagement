import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { booksApi } from '@/api/books.api';
import type { ResourceParameters } from '@/types/api.types';
import type { CreateBookRequestDto, UpdateBookRequestDto } from '@/types/book.types';

export const BOOKS_QUERY_KEY = 'books';
export const BOOK_QUERY_KEY = 'book';
export const BOOK_METADATA_QUERY_KEY = 'book-metadata';
export const DAILY_RECOMMENDATION_QUERY_KEY = 'daily-recommendation';
export const FAVORITES_QUERY_KEY = 'favorites';
export const RECOMMENDED_QUERY_KEY = 'recommended';

export function useBooks(params: ResourceParameters) {
  return useQuery({
    queryKey: [BOOKS_QUERY_KEY, params],
    queryFn: async () => {
      const response = await booksApi.getAll(params);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch books');
      }
      return response.data;
    },
  });
}

export function useBook(id: number, enabled: boolean = true) {
  return useQuery({
    queryKey: [BOOK_QUERY_KEY, id],
    queryFn: async () => {
      const response = await booksApi.getById(id);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch book');
      }
      return response.data;
    },
    enabled,
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateBookRequestDto) => {
      const response = await booksApi.create(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create book');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BOOKS_QUERY_KEY] });
    },
  });
}

export function useUpdateBook(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateBookRequestDto) => {
      const response = await booksApi.update(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update book');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BOOKS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [BOOK_QUERY_KEY, id] });
    },
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await booksApi.delete(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete book');
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BOOKS_QUERY_KEY] });
    },
  });
}

export function useUploadBookCover(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const response = await booksApi.uploadCoverImage(id, file);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to upload cover image');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BOOKS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [BOOK_QUERY_KEY, id] });
    },
  });
}

export function useBookMetadata(params: { isbn?: string; title?: string; author?: string }, enabled: boolean = false) {
  return useQuery({
    queryKey: [BOOK_METADATA_QUERY_KEY, params],
    queryFn: async () => {
      const response = await booksApi.fetchMetadata(params);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch book metadata');
      }
      return response.data;
    },
    enabled,
    retry: false, // Don't retry if not found
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

export function useDailyRecommendation() {
  return useQuery({
    queryKey: [DAILY_RECOMMENDATION_QUERY_KEY],
    queryFn: async () => {
      const response = await booksApi.getDailyRecommendation();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch daily recommendation');
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
  });
}

export function useFavorites(enabled: boolean = true) {
  return useQuery({
    queryKey: [FAVORITES_QUERY_KEY],
    queryFn: async () => {
      const response = await booksApi.getFavorites();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch favorites');
      }
      return response.data;
    },
    enabled,
  });
}

export function useRecommended(enabled: boolean = true) {
  return useQuery({
    queryKey: [RECOMMENDED_QUERY_KEY],
    queryFn: async () => {
      const response = await booksApi.getRecommended();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch recommended books');
      }
      return response.data;
    },
    enabled,
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await booksApi.addFavorite(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to add favorite');
      }
      return response.data; // boolean
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FAVORITES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [RECOMMENDED_QUERY_KEY] });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await booksApi.removeFavorite(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to remove favorite');
      }
      return response.data; // boolean
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FAVORITES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [RECOMMENDED_QUERY_KEY] });
    },
  });
}
