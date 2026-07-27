namespace LibraryManagement.Domain.Enums;

/// <summary>
/// Represents the status of a user's subscription.
/// </summary>
public enum SubscriptionStatus
{
    Active = 0,
    Expired = 1,
    Canceled = 2,
    Pending = 3,
    Rejected = 4
}
