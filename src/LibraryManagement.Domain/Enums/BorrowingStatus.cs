namespace LibraryManagement.Domain.Enums;

/// <summary>
/// Represents the lifecycle status of a book borrowing record.
/// </summary>
public enum BorrowingStatus
{
    /// <summary>
    /// The borrowing request is pending librarian approval.
    /// </summary>
    Pending = 0,

    /// <summary>
    /// The book is currently borrowed and not yet returned.
    /// </summary>
    Borrowed = 1,

    /// <summary>
    /// The book has been returned on time.
    /// </summary>
    Returned = 2,

    /// <summary>
    /// The book was not returned by the due date.
    /// </summary>
    Overdue = 3,

    /// <summary>
    /// The book was lost and not returned.
    /// </summary>
    Lost = 4,

    /// <summary>
    /// The borrowing request was approved.
    /// </summary>
    Approved = 5,

    /// <summary>
    /// The borrowing request was rejected.
    /// </summary>
    Rejected = 6
}
