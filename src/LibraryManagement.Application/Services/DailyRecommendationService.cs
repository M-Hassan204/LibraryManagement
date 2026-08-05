using LibraryManagement.Application.DTOs.Book;
using LibraryManagement.Application.Interfaces.Repositories;
using LibraryManagement.Application.Interfaces.Services;
using LibraryManagement.Domain.Entities;
using LibraryManagement.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagement.Application.Services;

public class DailyRecommendationService : IDailyRecommendationService
{
    private readonly IUnitOfWork _unitOfWork;

    public DailyRecommendationService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<BookDto>> GetTodayBookAsync()
    {
        var today = DateTime.UtcNow.Date;

        // Try to get today's recommendation
        var recommendation = await _unitOfWork.DailyRecommendations.Query()
            .Include(dr => dr.Book)
                .ThenInclude(b => b.Author)
            .Include(dr => dr.Book)
                .ThenInclude(b => b.Category)
            .FirstOrDefaultAsync(dr => dr.Date == today);

        if (recommendation == null)
            return await GenerateAndSaveRecommendationAsync(today);

        return ApiResponse<BookDto>.SuccessResponse(MapToDto(recommendation.Book), "Today's book retrieved.");
    }

    private async Task<ApiResponse<BookDto>> GenerateAndSaveRecommendationAsync(DateTime date)
    {
        // Get total count
        var totalBooks = await _unitOfWork.Books.Query().CountAsync();
        if (totalBooks == 0)
            return ApiResponse<BookDto>.FailureResponse("No books available for recommendation.");

        // Randomly select one
        var random = new Random();
        int skip = random.Next(0, totalBooks);

        var randomBook = await _unitOfWork.Books.Query()
            .Include(b => b.Author)
            .Include(b => b.Category)
            .Skip(skip)
            .FirstOrDefaultAsync();

        if (randomBook == null)
            return ApiResponse<BookDto>.FailureResponse("Failed to select a book.");

        var newRec = new DailyRecommendation
        {
            BookId = randomBook.Id,
            Date = date
        };

        await _unitOfWork.DailyRecommendations.AddAsync(newRec);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<BookDto>.SuccessResponse(MapToDto(randomBook), "New daily recommendation generated.");
    }

    private static BookDto MapToDto(Book book)
    {
        return new BookDto
        {
            Id = book.Id,
            Title = book.Title,
            ISBN = book.ISBN,
            Description = book.Description,
            CoverImageUrl = book.CoverImageUrl,
            PublishedYear = book.PublicationYear ?? 0,
            Status = book.Status,
            CategoryId = book.CategoryId,
            CategoryName = book.Category?.Name ?? string.Empty,
            AuthorId = book.AuthorId,
            AuthorName = book.Author?.FullName ?? string.Empty,
            CreatedAt = book.CreatedAt,
            UpdatedAt = book.UpdatedAt,
            Publisher = book.Publisher,
            Language = book.Language,
            Pages = book.Pages
        };
    }
}
