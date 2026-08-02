using LibraryManagement.Domain.Common;
using LibraryManagement.Domain.Enums;

namespace LibraryManagement.Domain.Entities;

/// <summary>
/// Represents a single borrowing transaction where a student borrows a book.
/// Tracks the full lifecycle from borrowing to return (or overdue/lost).
/// </summary>
public class BorrowingRecord : BaseEntity
{
    /// <summary>
    /// Gets or sets the FK referencing the student who borrowed the book.
    /// </summary>
    public string UserId { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the FK referencing the book that was borrowed.
    /// </summary>
    public int BookId { get; set; }

    /// <summary>
    /// Gets or sets the UTC date the book was borrowed. Null if not yet approved.
    /// </summary>
    public DateTime? BorrowedAt { get; set; }

    /// <summary>
    /// Gets or sets the UTC date by which the book must be returned. Null if not yet approved.
    /// </summary>
    public DateTime? DueDate { get; set; }

    /// <summary>
    /// Gets or sets the UTC date the book was actually returned.
    /// Null if the book has not been returned yet.
    /// </summary>
    public DateTime? ReturnedAt { get; set; }

    /// <summary>
    /// Gets or sets the current lifecycle status of this borrowing record.
    /// </summary>
    public BorrowingStatus Status { get; set; } = BorrowingStatus.Pending;

    /// <summary>
    /// Gets or sets any notes added by an admin when processing the return
    /// (e.g., damage notes, fine reason).
    /// </summary>
    public string? Notes { get; set; }

    /// <summary>
    /// Gets or sets the reason for rejection, if the request was rejected.
    /// </summary>
    public string? RejectionReason { get; set; }

    // ----- Navigation Properties -----

    /// <summary>Gets or sets the student who borrowed the book.</summary>
    public ApplicationUser User { get; set; } = null!;

    /// <summary>Gets or sets the book that was borrowed.</summary>
    public Book Book { get; set; } = null!;
}
