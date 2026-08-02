namespace LibraryManagement.Application.DTOs.Borrowing;

public class ApproveBorrowRequestDto
{
    public DateTime BorrowDate { get; set; }
    public DateTime DueDate { get; set; }
}
