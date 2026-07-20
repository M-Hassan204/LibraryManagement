namespace LibraryManagement.Application.DTOs.Auth;

public class SendOtpRequestDto
{
    public string Email { get; set; } = string.Empty;
    public string Purpose { get; set; } = string.Empty;
}
