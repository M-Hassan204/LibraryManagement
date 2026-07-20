namespace LibraryManagement.Domain.Enums;

/// <summary>
/// Represents the availability status of a book in the library system.
/// </summary>
public enum BookStatus
{
    /// <summary>
    /// The book is available for borrowing.
    /// </summary>
    Available = 1,

    /// <summary>
    /// The book is currently borrowed by a student.
    /// </summary>
    Borrowed = 2,

    /// <summary>
    /// The book has been reserved and is not available.
    /// </summary>
    Reserved = 3,

    /// <summary>
    /// The book is lost or damaged and cannot be borrowed.
    /// </summary>
    Unavailable = 4
}
