import { useMutation } from '@tanstack/react-query';
import { readingApi } from '@/api/reading.api';
import type { ReadBookRequestDto } from '@/types/reading.types';

export const useReadBook = () => {
  return useMutation({
    mutationFn: ({ bookId, data }: { bookId: number; data: ReadBookRequestDto }) => 
      readingApi.readBook(bookId, data),
  });
};
