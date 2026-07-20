using LibraryManagement.Application.DTOs.User;
using LibraryManagement.Shared.Models;

namespace LibraryManagement.Application.Interfaces.Services;

public interface IUserService
{
    Task<ApiResponse<UserDto>> GetProfileAsync(string userId);
    Task<ApiResponse<UserDto>> UpdateProfileAsync(string userId, UpdateProfileRequestDto request);
    Task<ApiResponse<bool>> ChangePasswordAsync(string userId, ChangePasswordRequestDto request);
}
