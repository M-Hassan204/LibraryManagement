using System.Net;

namespace LibraryManagement.Shared.Exceptions;

/// <summary>
/// Thrown when an authenticated user does not have the required role or permission
/// to perform an operation. Maps to HTTP 403 Forbidden.
/// </summary>
public class ForbiddenException : AppException
{
    /// <summary>
    /// Initializes a new <see cref="ForbiddenException"/> with a default message.
    /// </summary>
    public ForbiddenException()
        : base("You do not have permission to perform this action.", HttpStatusCode.Forbidden) { }

    /// <summary>
    /// Initializes a new <see cref="ForbiddenException"/> with a custom message.
    /// </summary>
    /// <param name="message">The descriptive error message.</param>
    public ForbiddenException(string message)
        : base(message, HttpStatusCode.Forbidden) { }
}
