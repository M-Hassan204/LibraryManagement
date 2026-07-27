using LibraryManagement.Application.DTOs.Delivery;
using LibraryManagement.Application.Interfaces.Repositories;
using LibraryManagement.Application.Interfaces.Services;
using LibraryManagement.Domain.Enums;
using LibraryManagement.Shared.Exceptions;
using LibraryManagement.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagement.Application.Services;

public class DeliveryService : IDeliveryService
{
    private readonly IUnitOfWork _unitOfWork;

    public DeliveryService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<PagedResult<DeliveryRequestDto>>> GetAllDeliveriesAsync(ResourceParameters parameters)
    {
        var query = _unitOfWork.DeliveryRequests.Query()
            .Include(d => d.User)
            .Include(d => d.Book)
            .AsQueryable();

        var totalCount = await query.CountAsync();

        var deliveries = await query
            .OrderByDescending(d => d.RequestedDate)
            .Skip((parameters.PageNumber - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .ToListAsync();

        var dtos = deliveries.Select(d => new DeliveryRequestDto
        {
            Id = d.Id,
            UserId = d.UserId,
            UserFullName = $"{d.User.FirstName} {d.User.LastName}",
            BookId = d.BookId,
            BookTitle = d.Book.Title,
            DeliveryAddress = d.DeliveryAddress,
            Status = d.Status,
            RequestedDate = d.RequestedDate,
            DeliveredDate = d.DeliveredDate
        }).ToList();

        var pagedResult = PagedResult<DeliveryRequestDto>.Create(dtos, totalCount, parameters.PageNumber, parameters.PageSize);
        return ApiResponse<PagedResult<DeliveryRequestDto>>.SuccessResponse(pagedResult, "Deliveries retrieved successfully.");
    }

    public async Task<ApiResponse<DeliveryRequestDto>> UpdateDeliveryStatusAsync(int deliveryId, UpdateDeliveryStatusDto request)
    {
        var delivery = await _unitOfWork.DeliveryRequests.Query()
            .Include(d => d.User)
            .Include(d => d.Book)
            .FirstOrDefaultAsync(d => d.Id == deliveryId);

        if (delivery == null)
            throw new NotFoundException("Delivery request not found.");

        delivery.Status = request.Status;
        if (request.Status == DeliveryStatus.Delivered)
        {
            delivery.DeliveredDate = DateTime.UtcNow;
        }

        _unitOfWork.DeliveryRequests.Update(delivery);
        await _unitOfWork.SaveChangesAsync();

        var dto = new DeliveryRequestDto
        {
            Id = delivery.Id,
            UserId = delivery.UserId,
            UserFullName = $"{delivery.User.FirstName} {delivery.User.LastName}",
            BookId = delivery.BookId,
            BookTitle = delivery.Book.Title,
            DeliveryAddress = delivery.DeliveryAddress,
            Status = delivery.Status,
            RequestedDate = delivery.RequestedDate,
            DeliveredDate = delivery.DeliveredDate
        };

        return ApiResponse<DeliveryRequestDto>.SuccessResponse(dto, "Delivery status updated successfully.");
    }
}
