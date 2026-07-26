namespace LibraryManagement.Application.DTOs.Admin.Users;

public class UpdateUserRequestDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Username { get; set; }
}
