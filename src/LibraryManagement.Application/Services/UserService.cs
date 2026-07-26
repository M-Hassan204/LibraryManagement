using LibraryManagement.Application.DTOs.User;
using LibraryManagement.Application.Interfaces.Services;
using LibraryManagement.Domain.Entities;
using LibraryManagement.Shared.Exceptions;
using LibraryManagement.Shared.Models;
using Microsoft.AspNetCore.Identity;

namespace LibraryManagement.Application.Services;

public class UserService : IUserService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IImageService _imageService;

    public UserService(UserManager<ApplicationUser> userManager, IImageService imageService)
    {
        _userManager = userManager;
        _imageService = imageService;
    }

    public async Task<ApiResponse<UserDto>> GetProfileAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new NotFoundException("User not found.");

        var roles = await _userManager.GetRolesAsync(user);

        var userDto = new UserDto
        {
            Id = user.Id,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = user.FullName,
            StudentId = user.StudentId,
            Department = user.Department,
            ProfileImageUrl = user.ProfileImageUrl,
            Roles = roles
        };

        return ApiResponse<UserDto>.SuccessResponse(userDto, "Profile retrieved successfully.");
    }

    public async Task<ApiResponse<UserDto>> UpdateProfileAsync(string userId, UpdateProfileRequestDto request)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new NotFoundException("User not found.");

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.StudentId = request.StudentId;
        user.Department = request.Department;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            throw new ValidationException(result.Errors.Select(e => e.Description).ToList());

        var roles = await _userManager.GetRolesAsync(user);

        var userDto = new UserDto
        {
            Id = user.Id,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = user.FullName,
            StudentId = user.StudentId,
            Department = user.Department,
            ProfileImageUrl = user.ProfileImageUrl,
            Roles = roles
        };

        return ApiResponse<UserDto>.SuccessResponse(userDto, "Profile updated successfully.");
    }

    public async Task<ApiResponse<bool>> ChangePasswordAsync(string userId, ChangePasswordRequestDto request)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new NotFoundException("User not found.");

        var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!result.Succeeded)
            throw new ValidationException(result.Errors.Select(e => e.Description).ToList());

        return ApiResponse<bool>.SuccessResponse(true, "Password changed successfully.");
    }

    public async Task<ApiResponse<UserDto>> UploadProfileImageAsync(string userId, Stream imageStream, string fileName)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new NotFoundException("User not found.");

        if (!string.IsNullOrEmpty(user.ProfileImageUrl))
        {
            _imageService.DeleteImage(user.ProfileImageUrl);
        }

        var imageUrl = await _imageService.UploadImageAsync(imageStream, fileName, "users");
        
        user.ProfileImageUrl = imageUrl;
        var result = await _userManager.UpdateAsync(user);
        
        if (!result.Succeeded)
            throw new ValidationException(result.Errors.Select(e => e.Description).ToList());

        var roles = await _userManager.GetRolesAsync(user);

        var userDto = new UserDto
        {
            Id = user.Id,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = user.FullName,
            StudentId = user.StudentId,
            Department = user.Department,
            ProfileImageUrl = user.ProfileImageUrl,
            Roles = roles
        };

        return ApiResponse<UserDto>.SuccessResponse(userDto, "Profile image uploaded successfully.");
    }

    public async Task<ApiResponse<UserDto>> RemoveProfileImageAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new NotFoundException("User not found.");

        if (!string.IsNullOrEmpty(user.ProfileImageUrl))
        {
            _imageService.DeleteImage(user.ProfileImageUrl);
            user.ProfileImageUrl = null;
            
            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                throw new ValidationException(result.Errors.Select(e => e.Description).ToList());
        }

        var roles = await _userManager.GetRolesAsync(user);

        var userDto = new UserDto
        {
            Id = user.Id,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = user.FullName,
            StudentId = user.StudentId,
            Department = user.Department,
            ProfileImageUrl = user.ProfileImageUrl,
            Roles = roles
        };

        return ApiResponse<UserDto>.SuccessResponse(userDto, "Profile image removed successfully.");
    }
}
