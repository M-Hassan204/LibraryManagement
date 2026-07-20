using LibraryManagement.Application.DTOs.Auth;
using LibraryManagement.Shared.Models;

namespace LibraryManagement.Application.Interfaces.Services;

public interface IOtpService
{
    Task<ApiResponse<bool>> SendOtpAsync(SendOtpRequestDto request);
    Task<ApiResponse<bool>> VerifyOtpAsync(VerifyOtpRequestDto request);
}
