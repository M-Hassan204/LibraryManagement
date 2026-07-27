using LibraryManagement.Application.DTOs.Admin.Users;
using LibraryManagement.Application.Interfaces.Services;
using LibraryManagement.Shared.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LibraryManagement.API.Controllers;

[Authorize(Roles = "Admin")]
[Route("api/admin/users")]
public class AdminUsersController : BaseApiController
{
    private readonly IAdminUserService _adminUserService;

    public AdminUsersController(IAdminUserService adminUserService)
    {
        _adminUserService = adminUserService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<AdminUserDto>>>> GetUsers([FromQuery] UserResourceParameters parameters)
    {
        return Ok(await _adminUserService.GetUsersAsync(parameters));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<AdminUserDto>>> GetUserById(string id)
    {
        return Ok(await _adminUserService.GetUserByIdAsync(id));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<AdminUserDto>>> UpdateUser(string id, [FromBody] UpdateUserRequestDto request)
    {
        return Ok(await _adminUserService.UpdateUserAsync(id, request));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse>> DeleteUser(string id)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(currentUserId)) return Unauthorized();

        return Ok(await _adminUserService.DeleteUserAsync(id, currentUserId));
    }

    [HttpPost("{id}/lock")]
    public async Task<ActionResult<ApiResponse>> LockUser(string id)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(currentUserId)) return Unauthorized();

        return Ok(await _adminUserService.LockUserAsync(id, currentUserId));
    }

    [HttpPost("{id}/unlock")]
    public async Task<ActionResult<ApiResponse>> UnlockUser(string id)
    {
        return Ok(await _adminUserService.UnlockUserAsync(id));
    }

    [HttpPost("{id}/activate")]
    public async Task<ActionResult<ApiResponse>> ActivateUser(string id)
    {
        return Ok(await _adminUserService.ActivateUserAsync(id));
    }

    [HttpPost("{id}/deactivate")]
    public async Task<ActionResult<ApiResponse>> DeactivateUser(string id)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(currentUserId)) return Unauthorized();

        return Ok(await _adminUserService.DeactivateUserAsync(id, currentUserId));
    }

    [HttpPost("{id}/roles")]
    public async Task<ActionResult<ApiResponse>> AssignRole(string id, [FromBody] AssignRoleRequestDto request)
    {
        return Ok(await _adminUserService.AssignRoleAsync(id, request));
    }

    [HttpDelete("{id}/roles/{role}")]
    public async Task<ActionResult<ApiResponse>> RemoveRole(string id, string role)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(currentUserId)) return Unauthorized();

        return Ok(await _adminUserService.RemoveRoleAsync(id, role, currentUserId));
    }

    [HttpPut("{id}/roles")]
    public async Task<ActionResult<ApiResponse>> UpdateRoles(string id, [FromBody] UpdateRolesRequestDto request)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(currentUserId)) return Unauthorized();

        return Ok(await _adminUserService.UpdateRolesAsync(id, request, currentUserId));
    }
}
