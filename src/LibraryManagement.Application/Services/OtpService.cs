using LibraryManagement.Application.DTOs.Auth;
using LibraryManagement.Application.Interfaces.Repositories;
using LibraryManagement.Application.Interfaces.Services;
using LibraryManagement.Domain.Entities;
using LibraryManagement.Shared.Exceptions;
using LibraryManagement.Shared.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace LibraryManagement.Application.Services;

public class OtpService : IOtpService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IEmailService _emailService;
    private readonly ILogger<OtpService> _logger;

    public OtpService(IUnitOfWork unitOfWork, UserManager<ApplicationUser> userManager, IEmailService emailService, ILogger<OtpService> logger)
    {
        _unitOfWork = unitOfWork;
        _userManager = userManager;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<ApiResponse<bool>> SendOtpAsync(SendOtpRequestDto request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
            throw new NotFoundException("User not found.");

        // Invalidate previous OTPs for this purpose
        var previousOtps = await _unitOfWork.OtpCodes.FindAsync(o => o.UserId == user.Id && o.Purpose == request.Purpose && !o.IsUsed);
        foreach (var otp in previousOtps)
        {
            otp.IsUsed = true;
            _unitOfWork.OtpCodes.Update(otp);
        }

        // Generate 6-digit OTP
        var random = new Random();
        var code = random.Next(100000, 999999).ToString();

        var newOtp = new OtpCode
        {
            UserId = user.Id,
            Code = code,
            Purpose = request.Purpose,
            ExpiresAt = DateTime.UtcNow.AddMinutes(10), // OTP valid for 10 mins
            CreatedAt = DateTime.UtcNow,
            IsUsed = false
        };

        await _unitOfWork.OtpCodes.AddAsync(newOtp);
        await _unitOfWork.SaveChangesAsync();

        // Send email
        var subject = $"Your OTP for {request.Purpose}";
        var body = $"<p>Your One-Time Password (OTP) is: <strong>{code}</strong></p><p>This code will expire in 10 minutes.</p>";
        
        try
        {
            await _emailService.SendEmailAsync(user.Email!, subject, body);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send OTP email to {Email} for {Purpose}.", user.Email, request.Purpose);
            return ApiResponse<bool>.FailureResponse("Could not send the OTP email due to a server error. Please try again later.");
        }

        return ApiResponse<bool>.SuccessResponse(true, "OTP sent successfully.");
    }

    public async Task<ApiResponse<bool>> VerifyOtpAsync(VerifyOtpRequestDto request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
            throw new NotFoundException("User not found.");

        var otpRecord = await _unitOfWork.OtpCodes.FirstOrDefaultAsync(o =>
            o.UserId == user.Id &&
            o.Purpose == request.Purpose &&
            o.Code == request.Code &&
            !o.IsUsed);

        if (otpRecord == null || !otpRecord.IsValid)
            throw new ValidationException(new List<string> { "Invalid or expired OTP." });

        // Mark as used
        otpRecord.IsUsed = true;
        _unitOfWork.OtpCodes.Update(otpRecord);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResponse(true, "OTP verified successfully.");
    }
}
