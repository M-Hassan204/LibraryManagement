using LibraryManagement.Application.DTOs.Subscription;
using LibraryManagement.Application.Interfaces.Repositories;
using LibraryManagement.Application.Interfaces.Services;
using LibraryManagement.Domain.Entities;
using LibraryManagement.Domain.Enums;
using LibraryManagement.Shared.Exceptions;
using LibraryManagement.Shared.Models;
using Microsoft.EntityFrameworkCore;

using Microsoft.AspNetCore.Identity;

namespace LibraryManagement.Application.Services;

public class SubscriptionService : ISubscriptionService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly UserManager<ApplicationUser> _userManager;

    public SubscriptionService(IUnitOfWork unitOfWork, UserManager<ApplicationUser> userManager)
    {
        _unitOfWork = unitOfWork;
        _userManager = userManager;
    }

    public async Task<ApiResponse<SubscriptionDto>> GetUserSubscriptionAsync(string userId)
    {
        var subscription = await _unitOfWork.Subscriptions.Query()
            .Include(s => s.User)
            .Where(s => s.UserId == userId && (s.Status == SubscriptionStatus.Active || s.Status == SubscriptionStatus.Pending))
            .OrderByDescending(s => s.Status == SubscriptionStatus.Pending ? 1 : 0) // prioritize pending
            .ThenByDescending(s => s.EndDate)
            .FirstOrDefaultAsync();

        if (subscription == null)
            throw new NotFoundException("Active subscription not found for the user.");

        var dto = MapToDto(subscription);
        return ApiResponse<SubscriptionDto>.SuccessResponse(dto, "Subscription retrieved successfully.");
    }


    public async Task<ApiResponse<PagedResult<SubscriptionDto>>> GetAllSubscriptionsAsync(ResourceParameters parameters)
    {
        var query = _unitOfWork.Subscriptions.Query()
            .Include(s => s.User)
            .AsQueryable();

        var totalCount = await query.CountAsync();

        var subscriptions = await query
            .OrderByDescending(s => s.StartDate)
            .Skip((parameters.PageNumber - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .ToListAsync();

        var dtos = subscriptions.Select(MapToDto).ToList();
        var pagedResult = PagedResult<SubscriptionDto>.Create(dtos, totalCount, parameters.PageNumber, parameters.PageSize);
        return ApiResponse<PagedResult<SubscriptionDto>>.SuccessResponse(pagedResult, "Subscriptions retrieved successfully.");
    }

    public async Task<ApiResponse<SubscriptionDto>> UpdateSubscriptionAsync(UpdateSubscriptionRequestDto request)
    {
        var subscription = await _unitOfWork.Subscriptions.Query()
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.Id == request.SubscriptionId);

        if (subscription == null)
            throw new NotFoundException("Subscription not found.");

        // If approving a pending subscription
        if (subscription.Status == SubscriptionStatus.Pending && request.Status == SubscriptionStatus.Active)
        {
            // Cancel existing active subscription
            var existingActive = await _unitOfWork.Subscriptions.Query()
                .Where(s => s.UserId == subscription.UserId && s.Status == SubscriptionStatus.Active)
                .FirstOrDefaultAsync();

            if (existingActive != null)
            {
                existingActive.Status = SubscriptionStatus.Canceled;
                _unitOfWork.Subscriptions.Update(existingActive);
            }

            subscription.StartDate = DateTime.UtcNow;
            subscription.EndDate = DateTime.UtcNow.AddMonths(1);
        }

        subscription.Plan = request.Plan;
        subscription.Status = request.Status;
        
        // Only update end date if it's explicitly provided and we aren't auto-setting it
        if (request.EndDate != default && !(subscription.Status == SubscriptionStatus.Active && request.Status == SubscriptionStatus.Active))
            subscription.EndDate = request.EndDate;

        _unitOfWork.Subscriptions.Update(subscription);
        await _unitOfWork.SaveChangesAsync();

        var dto = MapToDto(subscription);
        return ApiResponse<SubscriptionDto>.SuccessResponse(dto, "Subscription updated successfully.");
    }

    private SubscriptionDto MapToDto(Subscription subscription)
    {
        return new SubscriptionDto
        {
            Id = subscription.Id,
            UserId = subscription.UserId,
            UserFullName = $"{subscription.User.FirstName} {subscription.User.LastName}",
            UserEmail = subscription.User.Email ?? string.Empty,
            Plan = subscription.Plan,
            StartDate = subscription.StartDate,
            EndDate = subscription.EndDate,
            Status = subscription.Status
        };
    }
}
