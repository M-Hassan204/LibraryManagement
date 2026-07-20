using System.Net;

namespace LibraryManagement.Shared.Exceptions;

/// <summary>
/// Thrown when a user attempts to access a resource without valid authentication.
/// Maps to HTTP 401 Unauthorized.
/// </summary>
public class UnauthorizedException : AppException
{
    /// <summary>
    /// Initializes a new <see cref="UnauthorizedException"/> with a default message.
    /// </summary>
    public UnauthorizedException()
        : base("Authentication is required to access this resource.", HttpStatusCode.Unauthorized) { }

    /// <summary>
    /// Initializes a new <see cref="UnauthorizedException"/> with a custom message.
    /// </summary>
    /// <param name="message">The descriptive error message.</param>
    public UnauthorizedException(string message)
        : base(message, HttpStatusCode.Unauthorized) { }
}
