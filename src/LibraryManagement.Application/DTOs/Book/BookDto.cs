using LibraryManagement.Application.DTOs.Author;
using LibraryManagement.Application.DTOs.Category;
using LibraryManagement.Domain.Enums;

namespace LibraryManagement.Application.DTOs.Book;

public class BookDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ISBN { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CoverImageUrl { get; set; }
    public int PublishedYear { get; set; }
    public BookStatus Status { get; set; }
    
    public int CategoryId { get; set; }
    public CategoryDto? Category { get; set; }
    
    public int AuthorId { get; set; }
    public AuthorDto? Author { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
