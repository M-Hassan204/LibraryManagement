namespace LibraryManagement.Application.DTOs.Borrowing;

public class BorrowBookRequestDto
{
    public int BookId { get; set; }
    
    // For calculating the nearest branch for Free users
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    // For delivery requests for Premium users
    public string? DeliveryAddress { get; set; }
}
