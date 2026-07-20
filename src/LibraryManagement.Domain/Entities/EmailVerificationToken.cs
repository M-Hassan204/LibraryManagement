namespace LibraryManagement.Domain.Entities;

/// <summary>
/// Represents a token sent to a user's email address to verify account ownership.
/// After clicking the link, the token is consumed and the account is marked verified.
/// </summary>
public class EmailVerificationToken
{
    /// <summary>Gets or sets the primary key.</summary>
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the FK to the owning <see cref="ApplicationUser"/>.
    /// </summary>
    public string UserId { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the cryptographically secure verification token value
    /// that is embedded in the email link sent to the user.
    /// </summary>
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the UTC expiry date/time of this verification token.
    /// </summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// Gets or sets the UTC creation timestamp.
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Gets or sets whether this token has been used to verify the email.
    /// </summary>
    public bool IsUsed { get; set; } = false;

    /// <summary>
    /// Gets a value indicating whether this token is still valid for use.
    /// </summary>
    public bool IsValid => !IsUsed && DateTime.UtcNow < ExpiresAt;

    // ----- Navigation Properties -----

    /// <summary>Gets or sets the user this token was generated for.</summary>
    public ApplicationUser User { get; set; } = null!;
}
