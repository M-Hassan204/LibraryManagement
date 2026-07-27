using LibraryManagement.Application.DTOs.Book;
using LibraryManagement.Shared.Models;
using System.Threading.Tasks;

namespace LibraryManagement.Application.Interfaces.Services;

public interface IBookMetadataService
{
    Task<ApiResponse<BookMetadataDto>> FetchMetadataAsync(FetchBookMetadataRequestDto request);
}
