using LibraryManagement.Domain.Common;

namespace LibraryManagement.Domain.Entities;

/// <summary>
/// Represents a physical library branch.
/// </summary>
public class LibraryBranch : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Governorate { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string WorkingHours { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
