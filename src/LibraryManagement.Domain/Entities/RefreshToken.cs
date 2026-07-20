namespace LibraryManagement.Domain.Entities;

/// <summary>
/// Represents a JWT refresh token issued to a user, enabling session renewal
/// without requiring re-authentication. Tokens are rotated on each use
/// (Refresh Token Rotation pattern).
/// </summary>
public class RefreshToken
{
    /// <summary>Gets or sets the primary key.</summary>
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the FK to the owning <see cref="ApplicationUser"/>.
    /// </summary>
    public string UserId { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the cryptographically secure random token value.
    /// This value is stored as a hash in production but kept as plaintext here
    /// for demonstration — see infrastructure layer for hashing implementation.
    /// </summary>
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the UTC expiry date/time of this refresh token.
    /// </summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// Gets or sets the UTC date/time this token was created.
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Gets or sets the UTC date/time this token was revoked.
    /// Null if the token is still active.
    /// </summary>
    public DateTime? RevokedAt { get; set; }

    /// <summary>
    /// Gets or sets the replacement token issued when this token was rotated.
    /// </summary>
    public string? ReplacedByToken { get; set; }

    /// <summary>
    /// Gets a value indicating whether this token is currently active
    /// (not expired and not revoked).
    /// </summary>
    public bool IsActive => RevokedAt == null && DateTime.UtcNow < ExpiresAt;

    /// <summary>
    /// Gets a value indicating whether this token has expired.
    /// </summary>
    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;

    /// <summary>
    /// Gets a value indicating whether this token has been revoked.
    /// </summary>
    public bool IsRevoked => RevokedAt != null;

    // ----- Navigation Properties -----

    /// <summary>Gets or sets the user who owns this refresh token.</summary>
    public ApplicationUser User { get; set; } = null!;
}
