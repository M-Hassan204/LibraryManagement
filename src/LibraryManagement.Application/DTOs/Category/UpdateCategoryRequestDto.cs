namespace LibraryManagement.Application.DTOs.Category;

public class UpdateCategoryRequestDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}
