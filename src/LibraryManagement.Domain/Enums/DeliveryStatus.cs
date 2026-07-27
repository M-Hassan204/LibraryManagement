namespace LibraryManagement.Domain.Enums;

/// <summary>
/// Represents the status of a delivery request for a Premium user.
/// </summary>
public enum DeliveryStatus
{
    Pending = 0,
    Preparing = 1,
    OutForDelivery = 2,
    Delivered = 3
}
