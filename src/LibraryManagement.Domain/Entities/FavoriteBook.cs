using LibraryManagement.Domain.Common;

namespace LibraryManagement.Domain.Entities;

/// <summary>
/// Represents a user's favorite book.
/// </summary>
public class FavoriteBook : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public int BookId { get; set; }

    public ApplicationUser User { get; set; } = null!;
    public Book Book { get; set; } = null!;
}
