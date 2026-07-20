namespace LibraryManagement.Domain.Constants;

/// <summary>
/// Contains all application role name constants used for authorization.
/// </summary>
public static class AppRoles
{
    /// <summary>Admin role — full system access.</summary>
    public const string Admin = "Admin";

    /// <summary>Student role — limited borrowing and search access.</summary>
    public const string Student = "Student";
}
