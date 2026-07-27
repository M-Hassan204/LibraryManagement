using LibraryManagement.Domain.Common;
using LibraryManagement.Domain.Enums;

namespace LibraryManagement.Domain.Entities;

/// <summary>
/// Represents a delivery request for a Premium user borrowing a physical book.
/// </summary>
public class DeliveryRequest : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public int BookId { get; set; }
    
    // We could link this to BorrowingRecordId, but keeping it standalone per requirements
    // Although typically a delivery is associated with a borrowing.
    // Let's add BorrowingRecordId to make it traceable.
    public int? BorrowingRecordId { get; set; }

    public string DeliveryAddress { get; set; } = string.Empty;
    public DeliveryStatus Status { get; set; } = DeliveryStatus.Pending;
    public DateTime RequestedDate { get; set; } = DateTime.UtcNow;
    public DateTime? DeliveredDate { get; set; }

    public ApplicationUser User { get; set; } = null!;
    public Book Book { get; set; } = null!;
    public BorrowingRecord? BorrowingRecord { get; set; }
}
