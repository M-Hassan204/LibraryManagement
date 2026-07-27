using LibraryManagement.Application.DTOs.Reading;
using LibraryManagement.Shared.Models;

namespace LibraryManagement.Application.Interfaces.Services;

public interface IReadingService
{
    Task<ApiResponse<ReadBookResponseDto>> ReadBookOnlineAsync(string userId, int bookId, ReadBookRequestDto request);
}
