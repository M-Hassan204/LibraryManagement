using LibraryManagement.Application.DTOs.Book;
using LibraryManagement.Shared.Models;

namespace LibraryManagement.Application.Interfaces.Services;

public interface IDailyRecommendationService
{
    Task<ApiResponse<BookDto>> GetTodayBookAsync();
}
