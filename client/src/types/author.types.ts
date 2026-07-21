// Mirrors: LibraryManagement.Application.DTOs.Author.*

export interface AuthorDto {
  id: number;
  name: string;
  biography?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateAuthorRequestDto {
  name: string;
  biography?: string;
}

export interface UpdateAuthorRequestDto {
  id: number;
  name: string;
  biography?: string;
}
