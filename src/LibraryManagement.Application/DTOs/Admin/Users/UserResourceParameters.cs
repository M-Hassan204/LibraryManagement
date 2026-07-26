using LibraryManagement.Shared.Models;

namespace LibraryManagement.Application.DTOs.Admin.Users;

public class UserResourceParameters : ResourceParameters
{
    public string? Role { get; set; }
    public bool? IsActive { get; set; }
}
