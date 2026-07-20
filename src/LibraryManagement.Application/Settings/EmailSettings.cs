namespace LibraryManagement.Application.Settings;

/// <summary>
/// Strongly-typed model for email/SMTP configuration bound from appsettings.json.
/// </summary>
public class EmailSettings
{
    /// <summary>The section name in appsettings.json.</summary>
    public const string SectionName = "EmailSettings";

    /// <summary>Gets or sets the SMTP server hostname.</summary>
    public string Host { get; set; } = string.Empty;

    /// <summary>Gets or sets the SMTP server port.</summary>
    public int Port { get; set; } = 587;

    /// <summary>Gets or sets whether to use SSL/TLS for the SMTP connection.</summary>
    public bool UseSsl { get; set; } = true;

    /// <summary>Gets or sets the SMTP authentication username.</summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>Gets or sets the SMTP authentication password or app password.</summary>
    public string Password { get; set; } = string.Empty;

    /// <summary>Gets or sets the display name shown in the From field.</summary>
    public string FromName { get; set; } = "Library Management System";

    /// <summary>Gets or sets the sender email address.</summary>
    public string FromEmail { get; set; } = string.Empty;
}
