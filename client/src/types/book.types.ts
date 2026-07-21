// Mirrors: LibraryManagement.Domain.Enums.BookStatus
export enum BookStatus {
  Available = 1,
  Borrowed = 2,
  Reserved = 3,
  Unavailable = 4,
}

// Mirrors: LibraryManagement.Application.DTOs.Author.AuthorDto
export interface AuthorDto {
  id: number;
  name: string;
  biography?: string;
  createdAt: string;
  updatedAt?: string;
}

// Mirrors: LibraryManagement.Application.DTOs.Category.CategoryDto
export interface CategoryDto {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

// Mirrors: LibraryManagement.Application.DTOs.Book.BookDto
export interface BookDto {
  id: number;
  title: string;
  isbn: string;
  description?: string;
  coverImageUrl?: string;
  publishedYear: number;
  status: BookStatus;
  categoryId: number;
  category?: CategoryDto;
  authorId: number;
  author?: AuthorDto;
  createdAt: string;
  updatedAt?: string;
}

// Mirrors: LibraryManagement.Application.DTOs.Book.CreateBookRequestDto
export interface CreateBookRequestDto {
  title: string;
  isbn: string;
  description?: string;
  publishedYear: number;
  categoryId: number;
  authorId: number;
}

// Mirrors: LibraryManagement.Application.DTOs.Book.UpdateBookRequestDto
export interface UpdateBookRequestDto {
  id: number;
  title: string;
  isbn: string;
  description?: string;
  publishedYear: number;
  status: BookStatus;
  categoryId: number;
  authorId: number;
}
