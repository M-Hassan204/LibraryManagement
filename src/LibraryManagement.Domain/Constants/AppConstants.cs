namespace LibraryManagement.Domain.Constants;

/// <summary>
/// Defines system-wide configuration constants.
/// </summary>
public static class AppConstants
{
    /// <summary>Default page size for paginated queries.</summary>
    public const int DefaultPageSize = 10;

    /// <summary>Maximum page size allowed per request.</summary>
    public const int MaxPageSize = 100;

    /// <summary>Default borrowing duration in days.</summary>
    public const int DefaultBorrowingDurationDays = 14;

    /// <summary>OTP validity window in minutes.</summary>
    public const int OtpExpiryMinutes = 10;

    /// <summary>Email verification token validity in hours.</summary>
    public const int EmailVerificationExpiryHours = 24;

    /// <summary>Refresh token validity in days.</summary>
    public const int RefreshTokenExpiryDays = 7;

    /// <summary>JWT access token validity in minutes.</summary>
    public const int JwtExpiryMinutes = 60;

    /// <summary>Maximum number of active borrowings per student.</summary>
    public const int MaxActiveBorrowingsPerStudent = 5;

    /// <summary>Allowed image extensions for book cover uploads.</summary>
    public static readonly string[] AllowedImageExtensions = [".jpg", ".jpeg", ".png", ".webp"];

    /// <summary>Maximum allowed image file size in bytes (5 MB).</summary>
    public const long MaxImageFileSizeBytes = 5 * 1024 * 1024;
}
