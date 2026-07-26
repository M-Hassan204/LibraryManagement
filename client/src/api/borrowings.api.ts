import axiosInstance from '@/api/axiosInstance';
import type { ApiResponse, PagedResult, ResourceParameters } from '@/types/api.types';
import type {
  BorrowBookRequestDto,
  BorrowingDto,
  ReturnBookRequestDto,
} from '@/types/borrowing.types';

export const borrowingsApi = {
  getAll(
    params: ResourceParameters,
  ): Promise<ApiResponse<PagedResult<BorrowingDto>>> {
    return axiosInstance
      .get<ApiResponse<PagedResult<BorrowingDto>>>('/borrowing', { params })
      .then((res) => res.data);
  },

  getById(id: number): Promise<ApiResponse<BorrowingDto>> {
    return axiosInstance
      .get<ApiResponse<BorrowingDto>>(`/borrowing/${id}`)
      .then((res) => res.data);
  },

  getMyBorrowings(): Promise<ApiResponse<BorrowingDto[]>> {
    return axiosInstance
      .get<ApiResponse<BorrowingDto[]>>('/borrowing/my-borrowings')
      .then((res) => res.data);
  },

  borrowBook(data: BorrowBookRequestDto): Promise<ApiResponse<BorrowingDto>> {
    return axiosInstance
      .post<ApiResponse<BorrowingDto>>('/borrowing/borrow', data)
      .then((res) => res.data);
  },

  returnBook(
    id: number,
    data: ReturnBookRequestDto,
  ): Promise<ApiResponse<BorrowingDto>> {
    return axiosInstance
      .post<ApiResponse<BorrowingDto>>(`/borrowing/${id}/return`, data)
      .then((res) => res.data);
  },
};
