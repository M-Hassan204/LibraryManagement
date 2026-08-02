// Mirrors: LibraryManagement.Domain.Enums.BorrowingStatus
export enum BorrowingStatus {
  Pending = 0,
  Borrowed = 1,
  Returned = 2,
  Overdue = 3,
  Lost = 4,
  Approved = 5,
  Rejected = 6,
}

// Mirrors: LibraryManagement.Application.DTOs.Borrowing.BorrowingDto
export interface BorrowingDto {
  id: number;
  userId: string;
  userName: string;
  bookId: number;
  bookTitle: string;
  borrowedAt?: string;
  dueDate?: string;
  returnedAt?: string;
  status: BorrowingStatus;
  notes?: string;
  rejectionReason?: string;
  homeDelivery: boolean;
  deliveryId?: number;
  deliveryStatus?: number; // Adjust enum if defined
  deliveryAddress?: string;
  branchId?: number;
  branchName?: string;
}

// Mirrors: LibraryManagement.Application.DTOs.Borrowing.BorrowBookRequestDto
export interface BorrowBookRequestDto {
  bookId: number;
  homeDelivery: boolean;
  latitude?: number;
  longitude?: number;
  deliveryAddress?: string;
  notes?: string;
}

// Mirrors: LibraryManagement.Application.DTOs.Borrowing.ReturnBookRequestDto
export interface ReturnBookRequestDto {
  notes?: string;
}

export interface RejectBorrowRequestDto {
  reason?: string;
}

export interface ApproveBorrowRequestDto {
  borrowDate: string;
  dueDate: string;
}
