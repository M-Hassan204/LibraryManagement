using LibraryManagement.Application.DTOs.User;
using LibraryManagement.Application.Interfaces.Services;
using LibraryManagement.Shared.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LibraryManagement.API.Controllers;

[Authorize]
public class UserController : BaseApiController
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        return Ok(await _userService.GetProfileAsync(userId));
    }

    [HttpPut("me")]
    public async Task<ActionResult<ApiResponse<UserDto>>> UpdateProfile([FromBody] UpdateProfileRequestDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        return Ok(await _userService.UpdateProfileAsync(userId, request));
    }

    [HttpPost("me/change-password")]
    public async Task<ActionResult<ApiResponse<bool>>> ChangePassword([FromBody] ChangePasswordRequestDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        return Ok(await _userService.ChangePasswordAsync(userId, request));
    }

    [HttpPost("me/profile-image")]
    public async Task<ActionResult<ApiResponse<UserDto>>> UploadProfileImage(IFormFile file)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse<UserDto>.FailureResponse("No file was uploaded."));

        using var stream = file.OpenReadStream();
        return Ok(await _userService.UploadProfileImageAsync(userId, stream, file.FileName));
    }

    [HttpDelete("me/profile-image")]
    public async Task<ActionResult<ApiResponse<UserDto>>> RemoveProfileImage()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        return Ok(await _userService.RemoveProfileImageAsync(userId));
    }
}
