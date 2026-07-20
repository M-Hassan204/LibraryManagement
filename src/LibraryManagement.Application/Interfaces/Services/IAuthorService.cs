using LibraryManagement.Application.DTOs.Author;
using LibraryManagement.Shared.Models;

namespace LibraryManagement.Application.Interfaces.Services;

public interface IAuthorService
{
    Task<ApiResponse<AuthorDto>> GetAuthorByIdAsync(int id);
    Task<ApiResponse<IEnumerable<AuthorDto>>> GetAllAuthorsAsync();
    Task<ApiResponse<AuthorDto>> CreateAuthorAsync(CreateAuthorRequestDto request);
    Task<ApiResponse<AuthorDto>> UpdateAuthorAsync(UpdateAuthorRequestDto request);
    Task<ApiResponse<bool>> DeleteAuthorAsync(int id);
}
