namespace LibraryManagement.Application.DTOs.Author;

public class UpdateAuthorRequestDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Biography { get; set; }
}
