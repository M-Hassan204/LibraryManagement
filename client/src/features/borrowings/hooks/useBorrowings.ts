import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { borrowingsApi } from '@/api/borrowings.api';
import type { ResourceParameters } from '@/types/api.types';
import type { ReturnBookRequestDto, BorrowBookRequestDto, RejectBorrowRequestDto, ApproveBorrowRequestDto } from '@/types/borrowing.types';

export const ALL_BORROWINGS_QUERY_KEY = 'allBorrowings';
export const MY_BORROWINGS_QUERY_KEY = 'myBorrowings';
export const BORROWING_QUERY_KEY = 'borrowing';

export function useAllBorrowings(params: ResourceParameters) {
  return useQuery({
    queryKey: [ALL_BORROWINGS_QUERY_KEY, params],
    queryFn: async () => {
      const response = await borrowingsApi.getAll(params);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch borrowings');
      }
      return response.data;
    },
  });
}

export function useBorrowing(id: number, enabled: boolean = true) {
  return useQuery({
    queryKey: [BORROWING_QUERY_KEY, id],
    queryFn: async () => {
      const response = await borrowingsApi.getById(id);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch borrowing details');
      }
      return response.data;
    },
    enabled,
  });
}

export function useReturnBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ReturnBookRequestDto }) => {
      const response = await borrowingsApi.returnBook(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to return book');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ALL_BORROWINGS_QUERY_KEY] });
    },
  });
}

export function useBorrowBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: BorrowBookRequestDto) => {
      const response = await borrowingsApi.borrowBook(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to borrow book');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ALL_BORROWINGS_QUERY_KEY] });
    },
  });
}
export function useMyBorrowings() {
  return useQuery({
    queryKey: [MY_BORROWINGS_QUERY_KEY],
    queryFn: async () => {
      const response = await borrowingsApi.getMyBorrowings();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch my borrowings');
      }
      return response.data;
    },
  });
}

export function useApproveBorrowing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ApproveBorrowRequestDto }) => {
      const response = await borrowingsApi.approveBorrowing(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to approve borrowing request');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ALL_BORROWINGS_QUERY_KEY] });
    },
  });
}

export function useRejectBorrowing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: RejectBorrowRequestDto }) => {
      const response = await borrowingsApi.rejectBorrowing(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to reject borrowing request');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ALL_BORROWINGS_QUERY_KEY] });
    },
  });
}
