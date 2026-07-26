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
      .get<ApiResponse<PagedResult<BookDto>>>('/book', { params })
      .then((res) => res.data);
  },

  getById(id: number): Promise<ApiResponse<BookDto>> {
    return axiosInstance
      .get<ApiResponse<BookDto>>(`/book/${id}`)
      .then((res) => res.data);
  },

  create(data: CreateBookRequestDto): Promise<ApiResponse<BookDto>> {
    return axiosInstance
      .post<ApiResponse<BookDto>>('/book', data)
      .then((res) => res.data);
  },

  update(id: number, data: UpdateBookRequestDto): Promise<ApiResponse<BookDto>> {
    return axiosInstance
      .put<ApiResponse<BookDto>>(`/book/${id}`, data)
      .then((res) => res.data);
  },

  delete(id: number): Promise<ApiResponse<boolean>> {
    return axiosInstance
      .delete<ApiResponse<boolean>>(`/book/${id}`)
      .then((res) => res.data);
  },

  uploadCoverImage(id: number, file: File): Promise<ApiResponse<BookDto>> {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance
      .post<ApiResponse<BookDto>>(`/book/${id}/cover-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data);
  },
};
