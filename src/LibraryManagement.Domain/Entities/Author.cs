using LibraryManagement.Domain.Common;

namespace LibraryManagement.Domain.Entities;

/// <summary>
/// Represents a book author in the library system.
/// An author can be associated with multiple books.
/// </summary>
public class Author : BaseEntity
{
    /// <summary>
    /// Gets or sets the author's first name.
    /// </summary>
    public string FirstName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the author's last name.
    /// </summary>
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// Gets the author's full name as a computed display value.
    /// </summary>
    public string FullName => $"{FirstName} {LastName}";

    /// <summary>
    /// Gets or sets a short biography of the author.
    /// </summary>
    public string? Bio { get; set; }

    /// <summary>
    /// Gets or sets the author's nationality.
    /// </summary>
    public string? Nationality { get; set; }

    // ----- Navigation Properties -----

    /// <summary>
    /// Gets or sets the collection of books written by this author.
    /// </summary>
    public ICollection<Book> Books { get; set; } = new List<Book>();
}
