namespace LibraryManagement.Application.DTOs.Book;

public class BookMetadataDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Publisher { get; set; }
    public int? PublishedYear { get; set; }
    public int? Pages { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? Language { get; set; }
    public string? ISBN10 { get; set; }
    public string? ISBN13 { get; set; }
    public List<string> Categories { get; set; } = new List<string>();
    public List<string> Authors { get; set; } = new List<string>();
}
