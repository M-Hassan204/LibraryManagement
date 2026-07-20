namespace LibraryManagement.Application.Settings;

/// <summary>
/// Strongly-typed model for JWT configuration bound from appsettings.json.
/// </summary>
public class JwtSettings
{
    /// <summary>The section name in appsettings.json.</summary>
    public const string SectionName = "JwtSettings";

    /// <summary>Gets or sets the signing secret key (minimum 32 characters).</summary>
    public string Secret { get; set; } = string.Empty;

    /// <summary>Gets or sets the token issuer (typically the API URL or name).</summary>
    public string Issuer { get; set; } = string.Empty;

    /// <summary>Gets or sets the intended token audience (the client application).</summary>
    public string Audience { get; set; } = string.Empty;

    /// <summary>Gets or sets the token validity window in minutes.</summary>
    public int ExpiryMinutes { get; set; } = 60;
}
