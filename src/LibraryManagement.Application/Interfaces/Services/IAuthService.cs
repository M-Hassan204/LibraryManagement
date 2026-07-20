using LibraryManagement.Application.DTOs.Auth;
using LibraryManagement.Shared.Models;

namespace LibraryManagement.Application.Interfaces.Services;

public interface IAuthService
{
    Task<ApiResponse<AuthResponseDto>> RegisterAsync(RegisterRequestDto request);
    Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginRequestDto request);
    Task<ApiResponse<AuthResponseDto>> RefreshTokenAsync(RefreshTokenRequestDto request);
    Task<ApiResponse<AuthResponseDto>> GoogleLoginAsync(GoogleAuthRequestDto request);
    Task<ApiResponse<bool>> VerifyEmailAsync(VerifyEmailRequestDto request);
    Task<ApiResponse<bool>> ResendVerificationEmailAsync(string email);
}
