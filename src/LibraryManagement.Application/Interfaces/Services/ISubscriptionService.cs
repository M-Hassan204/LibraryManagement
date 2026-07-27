using LibraryManagement.Application.DTOs.Subscription;
using LibraryManagement.Shared.Models;

namespace LibraryManagement.Application.Interfaces.Services;

public interface ISubscriptionService
{
    Task<ApiResponse<SubscriptionDto>> GetUserSubscriptionAsync(string userId);
    Task<ApiResponse<SubscriptionDto>> UpgradeToPremiumAsync(string userId);
    Task<ApiResponse<SubscriptionDto>> CancelSubscriptionAsync(string userId);
    
    // For Admin
    Task<ApiResponse<PagedResult<SubscriptionDto>>> GetAllSubscriptionsAsync(ResourceParameters parameters);
    Task<ApiResponse<SubscriptionDto>> UpdateSubscriptionAsync(UpdateSubscriptionRequestDto request);
}
