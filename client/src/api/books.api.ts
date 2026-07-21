import axiosInstance from '@/api/axiosInstance';
import type { ApiResponse, PagedResult, ResourceParameters } from '@/types/api.types';
import type {
  BookDto,
  CreateBookRequestDto,
  UpdateBookRequestDto,
} from '@/types/book.types';

export const booksApi = {
  getAll(
    params: ResourceParameters,
  ): Promise<ApiResponse<PagedResult<BookDto>>> {
    return axiosInstance
      .get<ApiResponse<PagedResult<BookDto>>>('/books', { params })
      .then((res) => res.data);
  },

  getById(id: number): Promise<ApiResponse<BookDto>> {
    return axiosInstance
      .get<ApiResponse<BookDto>>(`/books/${id}`)
      .then((res) => res.data);
  },

  create(data: CreateBookRequestDto): Promise<ApiResponse<BookDto>> {
    return axiosInstance
      .post<ApiResponse<BookDto>>('/books', data)
      .then((res) => res.data);
  },

  update(id: number, data: UpdateBookRequestDto): Promise<ApiResponse<BookDto>> {
    return axiosInstance
      .put<ApiResponse<BookDto>>(`/books/${id}`, data)
      .then((res) => res.data);
  },

  delete(id: number): Promise<ApiResponse<boolean>> {
    return axiosInstance
      .delete<ApiResponse<boolean>>(`/books/${id}`)
      .then((res) => res.data);
  },

  uploadCoverImage(id: number, file: File): Promise<ApiResponse<BookDto>> {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance
      .post<ApiResponse<BookDto>>(`/books/${id}/cover-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data);
  },
};
