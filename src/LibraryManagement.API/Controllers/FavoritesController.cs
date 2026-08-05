using LibraryManagement.Application.DTOs.Book;
using LibraryManagement.Application.Interfaces.Services;
using LibraryManagement.Shared.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibraryManagement.API.Controllers;

[Authorize]
public class FavoritesController : BaseApiController
{
    private readonly IFavoriteBookService _favoriteBookService;

    public FavoritesController(IFavoriteBookService favoriteBookService)
    {
        _favoriteBookService = favoriteBookService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<BookDto>>>> GetFavorites()
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<IEnumerable<BookDto>>.FailureResponse("User ID not found."));

        return Ok(await _favoriteBookService.GetUserFavoritesAsync(userId));
    }

    [HttpPost("{bookId:int}")]
    public async Task<ActionResult<ApiResponse<bool>>> AddFavorite(int bookId)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<bool>.FailureResponse("User ID not found."));

        return Ok(await _favoriteBookService.AddFavoriteAsync(userId, bookId));
    }

    [HttpDelete("{bookId:int}")]
    public async Task<ActionResult<ApiResponse<bool>>> RemoveFavorite(int bookId)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<bool>.FailureResponse("User ID not found."));

        return Ok(await _favoriteBookService.RemoveFavoriteAsync(userId, bookId));
    }
}
