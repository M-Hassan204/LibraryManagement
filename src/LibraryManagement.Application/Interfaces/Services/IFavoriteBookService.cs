using LibraryManagement.Application.DTOs.Book;
using LibraryManagement.Shared.Models;

namespace LibraryManagement.Application.Interfaces.Services;

public interface IFavoriteBookService
{
    Task<ApiResponse<bool>> ToggleFavoriteAsync(string userId, int bookId);
    Task<ApiResponse<bool>> AddFavoriteAsync(string userId, int bookId);
    Task<ApiResponse<bool>> RemoveFavoriteAsync(string userId, int bookId);
    Task<ApiResponse<IEnumerable<BookDto>>> GetUserFavoritesAsync(string userId);
    Task<ApiResponse<IEnumerable<BookDto>>> GetPersonalizedRecommendationsAsync(string userId);
}
