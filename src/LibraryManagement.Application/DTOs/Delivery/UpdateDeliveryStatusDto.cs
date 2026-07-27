using LibraryManagement.Domain.Enums;

namespace LibraryManagement.Application.DTOs.Delivery;

public class UpdateDeliveryStatusDto
{
    public DeliveryStatus Status { get; set; }
}
