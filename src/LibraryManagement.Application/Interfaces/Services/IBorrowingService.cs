using LibraryManagement.Application.DTOs.Borrowing;
using LibraryManagement.Shared.Models;

namespace LibraryManagement.Application.Interfaces.Services;

public interface IBorrowingService
{
    Task<ApiResponse<BorrowingDto>> BorrowBookAsync(string userId, BorrowBookRequestDto request);
    Task<ApiResponse<BorrowingDto>> ReturnBookAsync(int borrowingId, ReturnBookRequestDto request);
    Task<ApiResponse<IEnumerable<BorrowingDto>>> GetUserBorrowingsAsync(string userId);
    Task<ApiResponse<PagedResult<BorrowingDto>>> GetAllBorrowingsAsync(ResourceParameters parameters);
    Task<ApiResponse<BorrowingDto>> GetBorrowingByIdAsync(int id);
}
