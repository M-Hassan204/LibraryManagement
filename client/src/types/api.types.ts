// Mirrors: LibraryManagement.Shared.Models.ApiResponse<T>
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors: string[] | null;
  timestamp: string;
}

// Mirrors: LibraryManagement.Shared.Models.PagedResult<T>
export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Mirrors: LibraryManagement.Shared.Models.ResourceParameters
export interface ResourceParameters {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortDescending?: boolean;
}
