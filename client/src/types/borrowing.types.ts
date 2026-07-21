// Mirrors: LibraryManagement.Domain.Enums.BorrowingStatus
export enum BorrowingStatus {
  Active = 1,
  Returned = 2,
  Overdue = 3,
  Lost = 4,
}

// Mirrors: LibraryManagement.Application.DTOs.Borrowing.BorrowingDto
export interface BorrowingDto {
  id: number;
  userId: string;
  bookId: number;
  bookTitle: string;
  borrowedAt: string;
  dueDate: string;
  returnedAt?: string;
  status: BorrowingStatus;
  notes?: string;
}

// Mirrors: LibraryManagement.Application.DTOs.Borrowing.BorrowBookRequestDto
export interface BorrowBookRequestDto {
  bookId: number;
}

// Mirrors: LibraryManagement.Application.DTOs.Borrowing.ReturnBookRequestDto
export interface ReturnBookRequestDto {
  notes?: string;
}
