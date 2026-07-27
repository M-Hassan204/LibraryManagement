namespace LibraryManagement.Application.DTOs.Book;

public class FetchBookMetadataRequestDto
{
    public string? ISBN { get; set; }
    public string? Title { get; set; }
    public string? Author { get; set; }
}
