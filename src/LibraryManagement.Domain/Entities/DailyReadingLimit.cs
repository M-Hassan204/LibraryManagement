using LibraryManagement.Domain.Common;

namespace LibraryManagement.Domain.Entities;

/// <summary>
/// Tracks the unique books read by a user on a given day to enforce the Daily Reading Limit for Free users.
/// </summary>
public class DailyReadingLimit : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public DateTime Date { get; set; } // Stores only the date part
    public int PagesRead { get; set; } = 0;
    
    public ApplicationUser User { get; set; } = null!;
}
