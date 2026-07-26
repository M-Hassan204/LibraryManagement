using LibraryManagement.Application.DTOs.Admin.Users;
using LibraryManagement.Shared.Models;

namespace LibraryManagement.Application.Interfaces.Services;

public interface IAdminUserService
{
    Task<ApiResponse<PagedResult<AdminUserDto>>> GetUsersAsync(UserResourceParameters parameters);
    Task<ApiResponse<AdminUserDto>> GetUserByIdAsync(string id);
    Task<ApiResponse<AdminUserDto>> UpdateUserAsync(string id, UpdateUserRequestDto request);
    Task<ApiResponse> DeleteUserAsync(string id, string currentUserId);
    Task<ApiResponse> LockUserAsync(string id, string currentUserId);
    Task<ApiResponse> UnlockUserAsync(string id);
    Task<ApiResponse> ActivateUserAsync(string id);
    Task<ApiResponse> DeactivateUserAsync(string id, string currentUserId);
    Task<ApiResponse> AssignRoleAsync(string id, AssignRoleRequestDto request);
    Task<ApiResponse> RemoveRoleAsync(string id, string roleName, string currentUserId);
}
