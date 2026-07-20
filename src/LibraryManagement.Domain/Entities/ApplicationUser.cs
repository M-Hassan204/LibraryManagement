using Microsoft.AspNetCore.Identity;

namespace LibraryManagement.Domain.Entities;

/// <summary>
/// Extends ASP.NET Core Identity's <see cref="IdentityUser"/> with
/// application-specific profile fields for students and administrators.
/// The Id column inherits from IdentityUser as a string (GUID).
/// </summary>
public class ApplicationUser : IdentityUser
{
    /// <summary>
    /// Gets or sets the user's first name.
    /// </summary>
    public string FirstName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the user's last name.
    /// </summary>
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the user's full display name (computed property, not mapped).
    /// </summary>
    public string FullName => $"{FirstName} {LastName}";

    /// <summary>
    /// Gets or sets the relative or absolute path to the user's profile image.
    /// Null if no image has been uploaded.
    /// </summary>
    public string? ProfileImageUrl { get; set; }

    /// <summary>
    /// Gets or sets the UTC date and time when the account was created.
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Gets or sets whether the user account has been soft-deleted.
    /// Soft-deleted users cannot log in and are excluded from queries.
    /// </summary>
    public bool IsDeleted { get; set; } = false;

    /// <summary>
    /// Gets or sets the user's student ID number (applicable for Student role).
    /// Null for Admin users.
    /// </summary>
    public string? StudentId { get; set; }

    /// <summary>
    /// Gets or sets the department or faculty the student belongs to.
    /// </summary>
    public string? Department { get; set; }

    // ----- Navigation Properties -----

    /// <summary>
    /// Gets or sets the collection of refresh tokens issued to this user.
    /// </summary>
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();

    /// <summary>
    /// Gets or sets the collection of OTP codes generated for this user.
    /// </summary>
    public ICollection<OtpCode> OtpCodes { get; set; } = new List<OtpCode>();

    /// <summary>
    /// Gets or sets the collection of email verification tokens for this user.
    /// </summary>
    public ICollection<EmailVerificationToken> EmailVerificationTokens { get; set; } = new List<EmailVerificationToken>();

    /// <summary>
    /// Gets or sets the collection of borrowing records for this user.
    /// </summary>
    public ICollection<BorrowingRecord> BorrowingRecords { get; set; } = new List<BorrowingRecord>();
}
