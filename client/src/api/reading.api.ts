import axiosInstance from './axiosInstance';
import type { ApiResponse } from '@/types/api.types';
import type { ReadBookRequestDto } from '@/types/reading.types';

export const readingApi = {
  readBook: async (bookId: number, data: ReadBookRequestDto): Promise<ApiResponse<string>> => {
    const response = await axiosInstance.post(`/Reading/read/${bookId}`, data);
    return response.data;
  },
};
