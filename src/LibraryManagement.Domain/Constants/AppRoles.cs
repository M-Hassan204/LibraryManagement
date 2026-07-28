namespace LibraryManagement.Domain.Constants;

/// <summary>
/// Contains all application role name constants used for authorization.
/// </summary>
public static class AppRoles
{
    /// <summary>Admin role — full system access.</summary>
    public const string Admin = "Admin";

    /// <summary>Student role — limited borrowing and search access. (Legacy/Deprecated in favor of Member)</summary>
    public const string Student = "Student";

    /// <summary>Librarian role — library management access without full admin privileges.</summary>
    public const string Librarian = "Librarian";

    /// <summary>User role — standard member access. (Legacy)</summary>
    public const string User = "User";

    /// <summary>Member role — new standard access.</summary>
    public const string Member = "Member";
}
