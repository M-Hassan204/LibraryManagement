using LibraryManagement.Application.DTOs.Book;
using LibraryManagement.Shared.Models;
using System.Threading.Tasks;

namespace LibraryManagement.Application.Interfaces.Services;

public interface IBookMetadataService
{
    Task<ApiResponse<BookMetadataDto>> FetchMetadataAsync(FetchBookMetadataRequestDto request);

    /// <summary>
    /// Searches Google Books and returns up to <paramref name="maxResults"/> lightweight results.
    /// Unlike FetchMetadataAsync, this method does NOT download/re-upload cover images
    /// so that search remains fast. Cover thumbnails are returned as raw Google URLs.
    /// </summary>
    Task<ApiResponse<List<BookMetadataDto>>> SearchBooksAsync(string query, int maxResults = 10);
}
