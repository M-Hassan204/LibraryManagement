using LibraryManagement.Domain.Common;

namespace LibraryManagement.Domain.Entities;

/// <summary>
/// Represents the book of the day recommendation.
/// </summary>
public class DailyRecommendation : BaseEntity
{
    public int BookId { get; set; }
    public DateTime Date { get; set; } // The calendar date for this recommendation

    public Book Book { get; set; } = null!;
}
