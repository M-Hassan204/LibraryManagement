// Mirrors: LibraryManagement.Application.DTOs.Category.*

export interface CategoryDto {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCategoryRequestDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryRequestDto {
  id: number;
  name: string;
  description?: string;
}
