using LibraryManagement.Domain.Enums;

namespace LibraryManagement.Application.DTOs.Subscription;

public class UpdateSubscriptionRequestDto
{
    public int SubscriptionId { get; set; }
    public SubscriptionPlanType Plan { get; set; }
    public SubscriptionStatus Status { get; set; }
    public DateTime EndDate { get; set; }
}
