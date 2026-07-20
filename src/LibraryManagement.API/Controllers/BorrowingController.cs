using LibraryManagement.Application.DTOs.Borrowing;
using LibraryManagement.Application.Interfaces.Services;
using LibraryManagement.Domain.Constants;
using LibraryManagement.Shared.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LibraryManagement.API.Controllers;

[Authorize]
public class BorrowingController : BaseApiController
{
    private readonly IBorrowingService _borrowingService;

    public BorrowingController(IBorrowingService borrowingService)
    {
        _borrowingService = borrowingService;
    }

    [HttpPost("borrow")]
    public async Task<ActionResult<ApiResponse<BorrowingDto>>> BorrowBook([FromBody] BorrowBookRequestDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var response = await _borrowingService.BorrowBookAsync(userId, request);
        return Ok(response);
    }

    [HttpPost("{id}/return")]
    public async Task<ActionResult<ApiResponse<BorrowingDto>>> ReturnBook(int id, [FromBody] ReturnBookRequestDto request)
    {
        var response = await _borrowingService.ReturnBookAsync(id, request);
        return Ok(response);
    }

    [HttpGet("my-borrowings")]
    public async Task<ActionResult<ApiResponse<IEnumerable<BorrowingDto>>>> GetMyBorrowings()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var response = await _borrowingService.GetUserBorrowingsAsync(userId);
        return Ok(response);
    }

    [Authorize(Roles = AppRoles.Admin)]
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<BorrowingDto>>>> GetAllBorrowings([FromQuery] ResourceParameters parameters)
    {
        var response = await _borrowingService.GetAllBorrowingsAsync(parameters);
        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<BorrowingDto>>> GetBorrowing(int id)
    {
        var response = await _borrowingService.GetBorrowingByIdAsync(id);
        return Ok(response);
    }
}
