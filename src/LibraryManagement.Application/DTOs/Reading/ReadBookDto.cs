namespace LibraryManagement.Application.DTOs.Reading;

public class ReadBookRequestDto
{
    public int PageNumber { get; set; } = 1;
}

public class ReadBookResponseDto
{
    public int BookId { get; set; }
    public int PageNumber { get; set; }
    public string Content { get; set; } = string.Empty;
    public int TotalPages { get; set; }
    public bool HasReachedLimit { get; set; }
}
