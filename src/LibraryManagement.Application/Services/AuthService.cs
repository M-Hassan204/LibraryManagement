using LibraryManagement.Application.DTOs.Auth;
using LibraryManagement.Application.Interfaces.Repositories;
using LibraryManagement.Application.Interfaces.Services;
using LibraryManagement.Domain.Constants;
using LibraryManagement.Domain.Entities;
using LibraryManagement.Shared.Exceptions;
using LibraryManagement.Shared.Models;
using Microsoft.AspNetCore.Identity;

namespace LibraryManagement.Application.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IEmailService _emailService;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        IJwtTokenGenerator jwtTokenGenerator,
        IUnitOfWork unitOfWork,
        IEmailService emailService)
    {
        _userManager = userManager;
        _jwtTokenGenerator = jwtTokenGenerator;
        _unitOfWork = unitOfWork;
        _emailService = emailService;
    }

    public async Task<ApiResponse<AuthResponseDto>> RegisterAsync(RegisterRequestDto request)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
            throw new ConflictException("User with this email already exists.");

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            StudentId = request.StudentId,
            Department = request.Department,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => e.Description).ToList();
            throw new ValidationException(errors);
        }

        await _userManager.AddToRoleAsync(user, AppRoles.Student);

        // Generate email verification token
        var token = Guid.NewGuid().ToString("N");
        var verificationToken = new EmailVerificationToken
        {
            UserId = user.Id,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddHours(24),
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.EmailVerificationTokens.AddAsync(verificationToken);
        await _unitOfWork.SaveChangesAsync();

        // Send email
        // In a real app, this would be a link to the frontend
        var subject = "Verify your email address";
        var body = $"<p>Your email verification token is: <strong>{token}</strong></p>";
        await _emailService.SendEmailAsync(user.Email, subject, body);

        // Do not generate JWT for unverified users
        return ApiResponse<AuthResponseDto>.SuccessResponse(new AuthResponseDto
        {
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Roles = new List<string> { AppRoles.Student }
        }, "Registration successful. Please check your email to verify your account.");
    }

    public async Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginRequestDto request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
            throw new UnauthorizedException("Invalid email or password.");

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!isPasswordValid)
            throw new UnauthorizedException("Invalid email or password.");

        if (!user.EmailConfirmed)
            throw new UnauthorizedException("Email is not verified. Please verify your email first.");

        // Here we could implement Two-Factor Auth check
        // For simplicity, we just generate the token

        return await GenerateAuthResponseAsync(user);
    }

    public async Task<ApiResponse<AuthResponseDto>> RefreshTokenAsync(RefreshTokenRequestDto request)
    {
        // 1. Find the refresh token
        var storedToken = await _unitOfWork.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken);
        if (storedToken == null)
            throw new UnauthorizedException("Invalid refresh token.");

        if (!storedToken.IsActive)
            throw new UnauthorizedException("Refresh token is expired or revoked.");

        var user = await _userManager.FindByIdAsync(storedToken.UserId);
        if (user == null)
            throw new UnauthorizedException("User not found.");

        // 2. Revoke current token
        storedToken.RevokedAt = DateTime.UtcNow;
        _unitOfWork.RefreshTokens.Update(storedToken);

        // 3. Generate new tokens and return
        return await GenerateAuthResponseAsync(user);
    }

    public async Task<ApiResponse<AuthResponseDto>> GoogleLoginAsync(GoogleAuthRequestDto request)
    {
        try
        {
            var payload = await Google.Apis.Auth.GoogleJsonWebSignature.ValidateAsync(request.IdToken);
            
            var user = await _userManager.FindByEmailAsync(payload.Email);
            if (user == null)
            {
                // Create new user
                user = new ApplicationUser
                {
                    UserName = payload.Email,
                    Email = payload.Email,
                    FirstName = payload.GivenName ?? "Google",
                    LastName = payload.FamilyName ?? "User",
                    EmailConfirmed = true, // Trusted from Google
                    CreatedAt = DateTime.UtcNow
                };

                var result = await _userManager.CreateAsync(user);
                if (!result.Succeeded)
                {
                    throw new ValidationException(result.Errors.Select(e => e.Description).ToList());
                }

                await _userManager.AddToRoleAsync(user, AppRoles.Student);
            }

            return await GenerateAuthResponseAsync(user);
        }
        catch (Google.Apis.Auth.InvalidJwtException)
        {
            throw new UnauthorizedException("Invalid Google token.");
        }
    }

    public async Task<ApiResponse<bool>> VerifyEmailAsync(VerifyEmailRequestDto request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
            throw new NotFoundException("User not found.");

        if (user.EmailConfirmed)
            return ApiResponse<bool>.SuccessResponse(true, "Email is already verified.");

        var tokenRecord = await _unitOfWork.EmailVerificationTokens.FirstOrDefaultAsync(t => 
            t.UserId == user.Id && t.Token == request.Token);

        if (tokenRecord == null || !tokenRecord.IsValid)
            throw new ValidationException(new List<string> { "Invalid or expired verification token." });

        user.EmailConfirmed = true;
        var result = await _userManager.UpdateAsync(user);
        
        if (!result.Succeeded)
            throw new AppException("Failed to verify email.");

        // Delete token
        _unitOfWork.EmailVerificationTokens.Delete(tokenRecord);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResponse(true, "Email verified successfully.");
    }

    public async Task<ApiResponse<bool>> ResendVerificationEmailAsync(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
            throw new NotFoundException("User not found.");

        if (user.EmailConfirmed)
            throw new BusinessRuleException("Email is already verified.");

        // Invalidate old tokens
        var oldTokens = await _unitOfWork.EmailVerificationTokens.FindAsync(t => t.UserId == user.Id);
        _unitOfWork.EmailVerificationTokens.DeleteRange(oldTokens);

        var token = Guid.NewGuid().ToString("N");
        var verificationToken = new EmailVerificationToken
        {
            UserId = user.Id,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddHours(24),
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.EmailVerificationTokens.AddAsync(verificationToken);
        await _unitOfWork.SaveChangesAsync();

        var subject = "Verify your email address";
        var body = $"<p>Your new email verification token is: <strong>{token}</strong></p>";
        await _emailService.SendEmailAsync(user.Email!, subject, body);

        return ApiResponse<bool>.SuccessResponse(true, "Verification email sent successfully.");
    }

    private async Task<ApiResponse<AuthResponseDto>> GenerateAuthResponseAsync(ApplicationUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var jwtToken = _jwtTokenGenerator.GenerateToken(user, roles);
        var refreshTokenStr = _jwtTokenGenerator.GenerateRefreshToken();

        var refreshToken = new RefreshToken
        {
            Token = refreshTokenStr,
            UserId = user.Id,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(7) // 7 days valid
        };

        await _unitOfWork.RefreshTokens.AddAsync(refreshToken);
        await _unitOfWork.SaveChangesAsync();

        var response = new AuthResponseDto
        {
            Token = jwtToken,
            RefreshToken = refreshTokenStr,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Roles = roles,
            RequiresTwoFactor = false
        };

        return ApiResponse<AuthResponseDto>.SuccessResponse(response, "Authentication successful.");
    }
}
