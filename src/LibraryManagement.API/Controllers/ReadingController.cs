using LibraryManagement.Application.DTOs.Reading;
using LibraryManagement.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LibraryManagement.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ReadingController : ControllerBase
{
    private readonly IReadingService _readingService;

    public ReadingController(IReadingService readingService)
    {
        _readingService = readingService;
    }

    [HttpPost("book/{bookId}")]
    [Authorize]
    public async Task<IActionResult> ReadBookOnline(int bookId, [FromBody] ReadBookRequestDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var response = await _readingService.ReadBookOnlineAsync(userId, bookId, request);
        return Ok(response);
    }
}
