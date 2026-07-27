using LibraryManagement.Domain.Enums;

namespace LibraryManagement.Application.DTOs.Delivery;

public class DeliveryRequestDto
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserFullName { get; set; } = string.Empty;
    public int BookId { get; set; }
    public string BookTitle { get; set; } = string.Empty;
    public string DeliveryAddress { get; set; } = string.Empty;
    public DeliveryStatus Status { get; set; }
    public DateTime RequestedDate { get; set; }
    public DateTime? DeliveredDate { get; set; }
}
