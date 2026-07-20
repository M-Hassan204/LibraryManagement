using LibraryManagement.Domain.Common;
using LibraryManagement.Domain.Enums;

namespace LibraryManagement.Domain.Entities;

/// <summary>
/// Represents a book available in the library. Books belong to a <see cref="Category"/>
/// and are written by an <see cref="Author"/>. Each book can have multiple
/// <see cref="BorrowingRecord"/> entries over its lifetime.
/// </summary>
public class Book : BaseEntity
{
    /// <summary>
    /// Gets or sets the book title.
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the ISBN-13 identifier of the book.
    /// </summary>
    public string ISBN { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets a descriptive summary or synopsis of the book.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the publisher's name.
    /// </summary>
    public string? Publisher { get; set; }

    /// <summary>
    /// Gets or sets the year the book was published.
    /// </summary>
    public int? PublicationYear { get; set; }

    /// <summary>
    /// Gets or sets the total number of physical copies held by the library.
    /// </summary>
    public int TotalCopies { get; set; }

    /// <summary>
    /// Gets or sets the number of copies currently available for borrowing.
    /// </summary>
    public int AvailableCopies { get; set; }

    /// <summary>
    /// Gets or sets the current availability status of the book.
    /// </summary>
    public BookStatus Status { get; set; } = BookStatus.Available;

    /// <summary>
    /// Gets or sets the relative or absolute URL to the book cover image.
    /// Null if no cover has been uploaded.
    /// </summary>
    public string? CoverImageUrl { get; set; }

    /// <summary>
    /// Gets or sets the language the book is written in.
    /// </summary>
    public string Language { get; set; } = "English";

    /// <summary>
    /// Gets or sets the number of pages in the book.
    /// </summary>
    public int? Pages { get; set; }

    // ----- Foreign Keys -----

    /// <summary>Gets or sets the FK to the book's author.</summary>
    public int AuthorId { get; set; }

    /// <summary>Gets or sets the FK to the book's category.</summary>
    public int CategoryId { get; set; }

    // ----- Navigation Properties -----

    /// <summary>Gets or sets the author of this book.</summary>
    public Author Author { get; set; } = null!;

    /// <summary>Gets or sets the category this book belongs to.</summary>
    public Category Category { get; set; } = null!;

    /// <summary>Gets or sets the list of all borrowing records for this book.</summary>
    public ICollection<BorrowingRecord> BorrowingRecords { get; set; } = new List<BorrowingRecord>();
}
