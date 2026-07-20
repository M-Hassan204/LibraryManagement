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

    public BookController(IBookService bookService)
    {
        _bookService = bookService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<BookDto>>>> GetAllBooks([FromQuery] ResourceParameters parameters)
    {
        return Ok(await _bookService.GetAllBooksAsync(parameters));
    }

    [HttpGet("{id}")]
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
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<BookDto>>> UpdateBook(int id, [FromBody] UpdateBookRequestDto request)
    {
        if (id != request.Id)
            return BadRequest(ApiResponse<BookDto>.FailureResponse("ID mismatch between URL and body."));

        return Ok(await _bookService.UpdateBookAsync(request));
    }

    [Authorize(Roles = AppRoles.Admin)]
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteBook(int id)
    {
        return Ok(await _bookService.DeleteBookAsync(id));
    }

    [Authorize(Roles = AppRoles.Admin)]
    [HttpPost("{id}/cover-image")]
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
}
