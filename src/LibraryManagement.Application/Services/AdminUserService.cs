using AutoMapper;
using LibraryManagement.Application.DTOs.Admin.Users;
using LibraryManagement.Application.Interfaces.Services;
using LibraryManagement.Domain.Entities;
using LibraryManagement.Shared.Exceptions;
using LibraryManagement.Shared.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace LibraryManagement.Application.Services;

public class AdminUserService : IAdminUserService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IMapper _mapper;
    private readonly ILogger<AdminUserService> _logger;

    public AdminUserService(
        UserManager<ApplicationUser> userManager,
        IMapper mapper,
        ILogger<AdminUserService> logger)
    {
        _userManager = userManager;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<ApiResponse<PagedResult<AdminUserDto>>> GetUsersAsync(UserResourceParameters parameters)
    {
        var query = _userManager.Users.AsQueryable();

        // Filtering
        if (!string.IsNullOrWhiteSpace(parameters.SearchTerm))
        {
            var searchTerm = parameters.SearchTerm.Trim().ToLower();
            query = query.Where(u =>
                u.FirstName.ToLower().Contains(searchTerm) ||
                u.LastName.ToLower().Contains(searchTerm) ||
                (u.Email != null && u.Email.ToLower().Contains(searchTerm)) ||
                (u.UserName != null && u.UserName.ToLower().Contains(searchTerm)));
        }

        if (parameters.IsActive.HasValue)
        {
            var isDeleted = !parameters.IsActive.Value;
            query = query.Where(u => u.IsDeleted == isDeleted);
        }

        // We apply Role filtering in memory since GetUsersInRoleAsync evaluates instantly
        // Alternatively, we could join with UserRoles if we had the DbContext, 
        // but since we only have UserManager, doing it after fetching or using UserManager methods is best.
        // A simple approach is fetching all if Role filter is used, then applying.
        // For efficiency, we will execute the query and then filter by role if provided.
        // Wait, UserManager doesn't easily expose roles in IQueryable. Let's do it efficiently:
        
        List<ApplicationUser> usersList;
        if (!string.IsNullOrWhiteSpace(parameters.Role))
        {
            var usersInRole = await _userManager.GetUsersInRoleAsync(parameters.Role);
            var usersInRoleIds = usersInRole.Select(u => u.Id).ToList();
            query = query.Where(u => usersInRoleIds.Contains(u.Id));
        }

        // Sorting
        if (!string.IsNullOrWhiteSpace(parameters.SortBy))
        {
            var isDesc = parameters.SortDescending;
            query = parameters.SortBy.ToLower() switch
            {
                "firstname" => isDesc ? query.OrderByDescending(u => u.FirstName) : query.OrderBy(u => u.FirstName),
                "lastname" => isDesc ? query.OrderByDescending(u => u.LastName) : query.OrderBy(u => u.LastName),
                "email" => isDesc ? query.OrderByDescending(u => u.Email) : query.OrderBy(u => u.Email),
                "username" => isDesc ? query.OrderByDescending(u => u.UserName) : query.OrderBy(u => u.UserName),
                "registrationdate" => isDesc ? query.OrderByDescending(u => u.CreatedAt) : query.OrderBy(u => u.CreatedAt),
                _ => isDesc ? query.OrderByDescending(u => u.CreatedAt) : query.OrderBy(u => u.CreatedAt),
            };
        }
        else
        {
            query = query.OrderByDescending(u => u.CreatedAt);
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((parameters.PageNumber - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .ToListAsync();

        var dtos = new List<AdminUserDto>();
        foreach (var user in items)
        {
            var dto = _mapper.Map<AdminUserDto>(user);
            dto.Roles = await _userManager.GetRolesAsync(user);
            dtos.Add(dto);
        }

        var pagedResult = PagedResult<AdminUserDto>.Create(dtos, totalCount, parameters.PageNumber, parameters.PageSize);
        return ApiResponse<PagedResult<AdminUserDto>>.SuccessResponse(pagedResult, "Users retrieved successfully.");
    }

    public async Task<ApiResponse<AdminUserDto>> GetUserByIdAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            throw new NotFoundException("User not found.");

        var dto = _mapper.Map<AdminUserDto>(user);
        dto.Roles = await _userManager.GetRolesAsync(user);

        return ApiResponse<AdminUserDto>.SuccessResponse(dto, "User retrieved successfully.");
    }

    public async Task<ApiResponse<AdminUserDto>> UpdateUserAsync(string id, UpdateUserRequestDto request)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            throw new NotFoundException("User not found.");

        // Check duplicates if username changes
        if (!string.IsNullOrWhiteSpace(request.Username) && request.Username != user.UserName)
        {
            var existing = await _userManager.FindByNameAsync(request.Username);
            if (existing != null)
                throw new ValidationException(new List<string> { "Username is already taken." });
            
            var setUsernameResult = await _userManager.SetUserNameAsync(user, request.Username);
            if (!setUsernameResult.Succeeded)
                throw new ValidationException(setUsernameResult.Errors.Select(e => e.Description).ToList());
        }

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        
        if (request.PhoneNumber != user.PhoneNumber)
        {
            var setPhoneResult = await _userManager.SetPhoneNumberAsync(user, request.PhoneNumber);
            if (!setPhoneResult.Succeeded)
                throw new ValidationException(setPhoneResult.Errors.Select(e => e.Description).ToList());
        }

        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
            throw new ValidationException(updateResult.Errors.Select(e => e.Description).ToList());

        _logger.LogInformation("Admin updated user {UserId}", user.Id);

        var dto = _mapper.Map<AdminUserDto>(user);
        dto.Roles = await _userManager.GetRolesAsync(user);

        return ApiResponse<AdminUserDto>.SuccessResponse(dto, "User updated successfully.");
    }

    public async Task<ApiResponse> DeleteUserAsync(string id, string currentUserId)
    {
        if (id == currentUserId)
            throw new ValidationException(new List<string> { "You cannot delete your own account." });

        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            throw new NotFoundException("User not found.");

        // Prevent deleting the last admin
        if (await _userManager.IsInRoleAsync(user, "Admin"))
        {
            var admins = await _userManager.GetUsersInRoleAsync("Admin");
            if (admins.Count <= 1)
                throw new ValidationException(new List<string> { "You cannot delete the last administrator in the system." });
        }

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
            throw new ValidationException(result.Errors.Select(e => e.Description).ToList());

        _logger.LogInformation("Admin deleted user {UserId}", user.Id);
        return ApiResponse.Ok("User deleted successfully.");
    }

    public async Task<ApiResponse> LockUserAsync(string id, string currentUserId)
    {
        if (id == currentUserId)
            throw new ValidationException(new List<string> { "You cannot lock your own account." });

        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            throw new NotFoundException("User not found.");

        var result = await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);
        if (!result.Succeeded)
            throw new ValidationException(result.Errors.Select(e => e.Description).ToList());

        _logger.LogInformation("Admin locked user {UserId}", user.Id);
        return ApiResponse.Ok("User locked successfully.");
    }

    public async Task<ApiResponse> UnlockUserAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            throw new NotFoundException("User not found.");

        var result = await _userManager.SetLockoutEndDateAsync(user, null);
        if (!result.Succeeded)
            throw new ValidationException(result.Errors.Select(e => e.Description).ToList());

        _logger.LogInformation("Admin unlocked user {UserId}", user.Id);
        return ApiResponse.Ok("User unlocked successfully.");
    }

    public async Task<ApiResponse> ActivateUserAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            throw new NotFoundException("User not found.");

        user.IsDeleted = false;
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            throw new ValidationException(result.Errors.Select(e => e.Description).ToList());

        _logger.LogInformation("Admin activated user {UserId}", user.Id);
        return ApiResponse.Ok("User activated successfully.");
    }

    public async Task<ApiResponse> DeactivateUserAsync(string id, string currentUserId)
    {
        if (id == currentUserId)
            throw new ValidationException(new List<string> { "You cannot deactivate your own account." });

        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            throw new NotFoundException("User not found.");

        if (await _userManager.IsInRoleAsync(user, "Admin"))
        {
            var admins = await _userManager.GetUsersInRoleAsync("Admin");
            if (admins.Count(a => !a.IsDeleted) <= 1)
                throw new ValidationException(new List<string> { "You cannot deactivate the last active administrator." });
        }

        user.IsDeleted = true;
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            throw new ValidationException(result.Errors.Select(e => e.Description).ToList());

        _logger.LogInformation("Admin deactivated user {UserId}", user.Id);
        return ApiResponse.Ok("User deactivated successfully.");
    }

    public async Task<ApiResponse> AssignRoleAsync(string id, AssignRoleRequestDto request)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            throw new NotFoundException("User not found.");

        if (await _userManager.IsInRoleAsync(user, request.Role))
            throw new ValidationException(new List<string> { $"User already has the role '{request.Role}'." });

        var result = await _userManager.AddToRoleAsync(user, request.Role);
        if (!result.Succeeded)
            throw new ValidationException(result.Errors.Select(e => e.Description).ToList());

        _logger.LogInformation("Admin assigned role {Role} to user {UserId}", request.Role, user.Id);
        return ApiResponse.Ok($"Role '{request.Role}' assigned successfully.");
    }

    public async Task<ApiResponse> RemoveRoleAsync(string id, string roleName, string currentUserId)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            throw new NotFoundException("User not found.");

        if (!await _userManager.IsInRoleAsync(user, roleName))
            throw new ValidationException(new List<string> { $"User does not have the role '{roleName}'." });

        if (roleName.Equals("Admin", StringComparison.OrdinalIgnoreCase))
        {
            var admins = await _userManager.GetUsersInRoleAsync("Admin");
            if (admins.Count <= 1)
                throw new ValidationException(new List<string> { "You cannot remove the last administrator role in the system." });
                
            if (id == currentUserId)
                throw new ValidationException(new List<string> { "You cannot remove the administrator role from your own account." });
        }

        var result = await _userManager.RemoveFromRoleAsync(user, roleName);
        if (!result.Succeeded)
            throw new ValidationException(result.Errors.Select(e => e.Description).ToList());

        _logger.LogInformation("Admin removed role {Role} from user {UserId}", roleName, user.Id);
        return ApiResponse.Ok($"Role '{roleName}' removed successfully.");
    }
}
