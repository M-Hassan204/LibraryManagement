namespace LibraryManagement.Application.DTOs.Author;

public class CreateAuthorRequestDto
{
    public string Name { get; set; } = string.Empty;
    public string? Biography { get; set; }
}
