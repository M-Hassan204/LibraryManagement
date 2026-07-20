namespace LibraryManagement.Application.DTOs.Dashboard;

public class DashboardStatsDto
{
    public int TotalBooks { get; set; }
    public int TotalUsers { get; set; }
    public int ActiveBorrowings { get; set; }
    public int OverdueBooks { get; set; }
    public List<TopBookDto> TopBorrowedBooks { get; set; } = new List<TopBookDto>();
}

public class TopBookDto
{
    public int BookId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int BorrowCount { get; set; }
}
