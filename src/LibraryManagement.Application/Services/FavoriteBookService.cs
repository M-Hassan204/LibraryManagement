using LibraryManagement.Application.DTOs.Book;
using LibraryManagement.Application.Interfaces.Repositories;
using LibraryManagement.Application.Interfaces.Services;
using LibraryManagement.Domain.Entities;
using LibraryManagement.Shared.Exceptions;
using LibraryManagement.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagement.Application.Services;

public class FavoriteBookService : IFavoriteBookService
{
    private readonly IUnitOfWork _unitOfWork;

    public FavoriteBookService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<bool>> ToggleFavoriteAsync(string userId, int bookId)
    {
        var book = await _unitOfWork.Books.GetByIdAsync(bookId);
        if (book == null)
            throw new NotFoundException("Book not found.");

        var existingFavorite = await _unitOfWork.FavoriteBooks.Query()
            .FirstOrDefaultAsync(fb => fb.UserId == userId && fb.BookId == bookId);

        bool isFavorite;
        if (existingFavorite != null)
        {
            _unitOfWork.FavoriteBooks.Delete(existingFavorite);
            isFavorite = false;
        }
        else
        {
            await _unitOfWork.FavoriteBooks.AddAsync(new FavoriteBook
            {
                UserId = userId,
                BookId = bookId
            });
            isFavorite = true;
        }

        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<bool>.SuccessResponse(isFavorite, isFavorite ? "Book added to favorites." : "Book removed from favorites.");
    }

    public async Task<ApiResponse<IEnumerable<BookDto>>> GetUserFavoritesAsync(string userId)
    {
        var favorites = await _unitOfWork.FavoriteBooks.Query()
            .Include(fb => fb.Book)
                .ThenInclude(b => b.Author)
            .Include(fb => fb.Book)
                .ThenInclude(b => b.Category)
            .Where(fb => fb.UserId == userId)
            .Select(fb => fb.Book)
            .ToListAsync();

        var dtos = favorites.Select(MapToDto);
        return ApiResponse<IEnumerable<BookDto>>.SuccessResponse(dtos, "Favorites retrieved successfully.");
    }

    public async Task<ApiResponse<IEnumerable<BookDto>>> GetPersonalizedRecommendationsAsync(string userId)
    {
        // 1. Get user's favorite books to determine their favorite categories
        var favoriteBooks = await _unitOfWork.FavoriteBooks.Query()
            .Include(fb => fb.Book)
            .Where(fb => fb.UserId == userId)
            .Select(fb => fb.Book)
            .ToListAsync();

        if (!favoriteBooks.Any())
        {
            return ApiResponse<IEnumerable<BookDto>>.SuccessResponse(new List<BookDto>(), "No favorites found to base recommendations on.");
        }

        // Determine most liked category
        var mostLikedCategoryId = favoriteBooks
            .GroupBy(b => b.CategoryId)
            .OrderByDescending(g => g.Count())
            .Select(g => g.Key)
            .FirstOrDefault();

        var favoriteBookIds = favoriteBooks.Select(b => b.Id).ToHashSet();

        // 2. Recommend books from that category, excluding already favorited books
        // We limit to 6 books as per requirements
        var recommendedBooks = await _unitOfWork.Books.Query()
            .Include(b => b.Author)
            .Include(b => b.Category)
            .Where(b => b.CategoryId == mostLikedCategoryId && !favoriteBookIds.Contains(b.Id))
            .OrderByDescending(b => b.CreatedAt)
            .Take(6)
            .ToListAsync();

        var dtos = recommendedBooks.Select(MapToDto);
        return ApiResponse<IEnumerable<BookDto>>.SuccessResponse(dtos, "Recommendations retrieved successfully.");
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
