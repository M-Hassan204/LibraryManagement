namespace LibraryManagement.Application.DTOs.Admin.Users;

public class UpdateRolesRequestDto
{
    public List<string> Roles { get; set; } = new();
}