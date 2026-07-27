using LibraryManagement.Domain.Enums;

namespace LibraryManagement.Application.DTOs.Borrowing;

public class BorrowingDto
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int BookId { get; set; }
    public string BookTitle { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public DateTime BorrowedAt { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime? ReturnedAt { get; set; }
    public BorrowingStatus Status { get; set; }
    public string? Notes { get; set; }
    
    // For Free users
    public LibraryManagement.Application.DTOs.Branch.NearestBranchDto? NearestBranch { get; set; }
    
    // For Premium users
    public LibraryManagement.Application.DTOs.Delivery.DeliveryRequestDto? DeliveryRequest { get; set; }
}
