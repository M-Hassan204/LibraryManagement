using LibraryManagement.Domain.Enums;

namespace LibraryManagement.Application.DTOs.Subscription;

public class SubscriptionDto
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserFullName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public SubscriptionPlanType Plan { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public SubscriptionStatus Status { get; set; }
}
