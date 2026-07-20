using LibraryManagement.Application.DTOs.Book;
using LibraryManagement.Shared.Models;

namespace LibraryManagement.Application.Interfaces.Services;

public interface IBookService
{
    Task<ApiResponse<BookDto>> GetBookByIdAsync(int id);
    Task<ApiResponse<PagedResult<BookDto>>> GetAllBooksAsync(ResourceParameters parameters);
    Task<ApiResponse<BookDto>> CreateBookAsync(CreateBookRequestDto request);
    Task<ApiResponse<BookDto>> UpdateBookAsync(UpdateBookRequestDto request);
    Task<ApiResponse<bool>> DeleteBookAsync(int id);
    Task<ApiResponse<BookDto>> UploadCoverImageAsync(int id, Stream imageStream, string fileName);
}
