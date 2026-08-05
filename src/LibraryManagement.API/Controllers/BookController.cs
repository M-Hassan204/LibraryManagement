using LibraryManagement.Application.DTOs.Book;
using LibraryManagement.Application.Interfaces.Services;
using LibraryManagement.Domain.Constants;
using LibraryManagement.Shared.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibraryManagement.API.Controllers;

public class BookController : BaseApiController
{
    private readonly IBookService _bookService;
    private readonly IBookMetadataService _bookMetadataService;
    private readonly IFavoriteBookService _favoriteBookService;
    private readonly IDailyRecommendationService _dailyRecommendationService;

    public BookController(
        IBookService bookService, 
        IBookMetadataService bookMetadataService,
        IFavoriteBookService favoriteBookService,
        IDailyRecommendationService dailyRecommendationService)
    {
        _bookService = bookService;
        _bookMetadataService = bookMetadataService;
        _favoriteBookService = favoriteBookService;
        _dailyRecommendationService = dailyRecommendationService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<BookDto>>>> GetAllBooks([FromQuery] ResourceParameters parameters)
    {
        return Ok(await _bookService.GetAllBooksAsync(parameters));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<BookDto>>> GetBookById(int id)
    {
        return Ok(await _bookService.GetBookByIdAsync(id));
    }

    [Authorize(Roles = AppRoles.Admin)]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<BookDto>>> CreateBook([FromBody] CreateBookRequestDto request)
    {
        return Ok(await _bookService.CreateBookAsync(request));
    }

    [Authorize(Roles = AppRoles.Admin)]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ApiResponse<BookDto>>> UpdateBook(int id, [FromBody] UpdateBookRequestDto request)
    {
        if (id != request.Id)
            return BadRequest(ApiResponse<BookDto>.FailureResponse("ID mismatch between URL and body."));

        return Ok(await _bookService.UpdateBookAsync(request));
    }

    [Authorize(Roles = AppRoles.Admin)]
    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteBook(int id)
    {
        return Ok(await _bookService.DeleteBookAsync(id));
    }

    [Authorize(Roles = AppRoles.Admin)]
    [HttpPost("{id:int}/cover-image")]
    public async Task<ActionResult<ApiResponse<BookDto>>> UploadCoverImage(int id, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse<BookDto>.FailureResponse("No file was uploaded."));

        // Basic validation for image
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension))
            return BadRequest(ApiResponse<BookDto>.FailureResponse("Only image files (.jpg, .jpeg, .png, .gif) are allowed."));

        // Limit size to 5MB
        if (file.Length > 5 * 1024 * 1024)
            return BadRequest(ApiResponse<BookDto>.FailureResponse("File size cannot exceed 5MB."));

        using var stream = file.OpenReadStream();
        return Ok(await _bookService.UploadCoverImageAsync(id, stream, file.FileName));
    }

    [Authorize(Roles = AppRoles.Admin)]
    [HttpGet("metadata")]
    public async Task<ActionResult<ApiResponse<BookMetadataDto>>> GetMetadata([FromQuery] FetchBookMetadataRequestDto request)
    {
        return Ok(await _bookMetadataService.FetchMetadataAsync(request));
    }

    /// <summary>
    /// Searches Google Books via the backend and returns a list of matching books.
    /// Accepts isbn, title, and/or author as query parameters and builds the Google Books query server-side.
    /// This avoids browser-side CORS restrictions and API rate-limiting without an API key.
    /// </summary>
    [Authorize(Roles = AppRoles.Admin)]
    [HttpGet("search")]
    public async Task<ActionResult<ApiResponse<List<BookMetadataDto>>>> SearchBooks(
        [FromQuery] string? isbn,
        [FromQuery] string? title,
        [FromQuery] string? author)
    {
        // Build the Google Books query string server-side
        string query;
        if (!string.IsNullOrWhiteSpace(isbn))
        {
            query = isbn.Trim();
        }
        else
        {
            var parts = new List<string>();
            if (!string.IsNullOrWhiteSpace(title))
                parts.Add(title.Trim());
            if (!string.IsNullOrWhiteSpace(author))
                parts.Add(author.Trim());

            if (parts.Count == 0)
                return BadRequest(ApiResponse<List<BookMetadataDto>>.FailureResponse(
                    "Provide at least one search parameter: isbn, title, or author."));

            query = string.Join(" ", parts);
        }

        return Ok(await _bookMetadataService.SearchBooksAsync(query));
    }

    // ─── Daily Recommendation ──────────────────────────────────────

    [HttpGet("daily-recommendation")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<BookDto>>> GetDailyRecommendation()
    {
        return Ok(await _dailyRecommendationService.GetTodayBookAsync());
    }

    // ─── Personalized Recommendations / Favorites ──────────────────

    [Authorize]
    [HttpPost("{id:int}/favorite")]
    public async Task<ActionResult<ApiResponse<bool>>> ToggleFavorite(int id)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<bool>.FailureResponse("User ID not found."));

        return Ok(await _favoriteBookService.ToggleFavoriteAsync(userId, id));
    }

    [Authorize]
    [HttpGet("favorites")]
    public async Task<ActionResult<ApiResponse<IEnumerable<BookDto>>>> GetFavorites()
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<IEnumerable<BookDto>>.FailureResponse("User ID not found."));

        return Ok(await _favoriteBookService.GetUserFavoritesAsync(userId));
    }

    [Authorize]
    [HttpGet("recommended")]
    public async Task<ActionResult<ApiResponse<IEnumerable<BookDto>>>> GetRecommended()
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<IEnumerable<BookDto>>.FailureResponse("User ID not found."));

        return Ok(await _favoriteBookService.GetPersonalizedRecommendationsAsync(userId));
    }
}

