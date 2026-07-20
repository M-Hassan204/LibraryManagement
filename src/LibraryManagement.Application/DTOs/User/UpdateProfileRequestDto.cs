namespace LibraryManagement.Application.DTOs.User;

public class UpdateProfileRequestDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? StudentId { get; set; }
    public string? Department { get; set; }
}
