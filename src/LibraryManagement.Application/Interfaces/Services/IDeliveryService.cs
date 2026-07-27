using LibraryManagement.Application.DTOs.Delivery;
using LibraryManagement.Shared.Models;

namespace LibraryManagement.Application.Interfaces.Services;

public interface IDeliveryService
{
    Task<ApiResponse<PagedResult<DeliveryRequestDto>>> GetAllDeliveriesAsync(ResourceParameters parameters);
    Task<ApiResponse<DeliveryRequestDto>> UpdateDeliveryStatusAsync(int deliveryId, UpdateDeliveryStatusDto request);
}
