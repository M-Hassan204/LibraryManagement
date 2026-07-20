using LibraryManagement.Domain.Common;

namespace LibraryManagement.Domain.Entities;

/// <summary>
/// Represents a book category (genre) used to classify books in the library.
/// </summary>
public class Category : BaseEntity
{
    /// <summary>
    /// Gets or sets the display name of the category.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets an optional description for this category.
    /// </summary>
    public string? Description { get; set; }

    // ----- Navigation Properties -----

    /// <summary>
    /// Gets or sets the collection of books in this category.
    /// </summary>
    public ICollection<Book> Books { get; set; } = new List<Book>();
}
