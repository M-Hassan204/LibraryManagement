using LibraryManagement.Domain.Common;
using LibraryManagement.Domain.Enums;

namespace LibraryManagement.Domain.Entities;

/// <summary>
/// Represents a user's subscription history and current status.
/// </summary>
public class Subscription : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public SubscriptionPlanType Plan { get; set; } = SubscriptionPlanType.Free;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Active;

    public ApplicationUser User { get; set; } = null!;
}
