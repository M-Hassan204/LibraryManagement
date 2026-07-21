// Mirrors: LibraryManagement.Application.DTOs.Dashboard.*

export interface TopBookDto {
  bookId: number;
  title: string;
  borrowCount: number;
}

export interface DashboardStatsDto {
  totalBooks: number;
  totalUsers: number;
  activeBorrowings: number;
  overdueBooks: number;
  topBorrowedBooks: TopBookDto[];
}
