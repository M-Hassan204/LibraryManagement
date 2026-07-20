namespace LibraryManagement.Domain.Entities;

/// <summary>
/// Represents a time-based One-Time Password (OTP) code generated for a user.
/// Used for multi-factor authentication and sensitive operations.
/// </summary>
public class OtpCode
{
    /// <summary>Gets or sets the primary key.</summary>
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the FK to the owning <see cref="ApplicationUser"/>.
    /// </summary>
    public string UserId { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the 6-digit OTP code value.
    /// </summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the purpose of this OTP (e.g., "Login", "PasswordReset", "EmailVerification").
    /// </summary>
    public string Purpose { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the UTC expiry date/time of this OTP code.
    /// </summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// Gets or sets the UTC creation timestamp.
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Gets or sets whether this OTP has already been consumed.
    /// A used OTP cannot be reused even if it has not expired.
    /// </summary>
    public bool IsUsed { get; set; } = false;

    /// <summary>
    /// Gets a value indicating whether this OTP code is still valid.
    /// </summary>
    public bool IsValid => !IsUsed && DateTime.UtcNow < ExpiresAt;

    // ----- Navigation Properties -----

    /// <summary>Gets or sets the user this OTP was generated for.</summary>
    public ApplicationUser User { get; set; } = null!;
}
