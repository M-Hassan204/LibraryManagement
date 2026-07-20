using System.Net;

namespace LibraryManagement.Shared.Exceptions;

/// <summary>
/// Base exception for all application-level domain and business rule violations.
/// Every custom exception in the system inherits from this class.
/// The <see cref="StatusCode"/> property maps to an HTTP status code so that
/// the global exception middleware can produce the correct response automatically.
/// </summary>
public class AppException : Exception
{
    /// <summary>
    /// Gets the HTTP status code that should be returned to the client.
    /// </summary>
    public HttpStatusCode StatusCode { get; }

    /// <summary>
    /// Gets the list of detailed error messages. May contain multiple validation errors.
    /// </summary>
    public IReadOnlyList<string> Errors { get; }

    /// <summary>
    /// Initializes a new instance of <see cref="AppException"/> with a single error message.
    /// </summary>
    /// <param name="message">The human-readable error description.</param>
    /// <param name="statusCode">The HTTP status code to return. Defaults to 400 Bad Request.</param>
    public AppException(string message, HttpStatusCode statusCode = HttpStatusCode.BadRequest)
        : base(message)
    {
        StatusCode = statusCode;
        Errors = [message];
    }

    /// <summary>
    /// Initializes a new instance of <see cref="AppException"/> with multiple error messages.
    /// </summary>
    /// <param name="message">The summary error message.</param>
    /// <param name="errors">The detailed list of errors (e.g., validation failures).</param>
    /// <param name="statusCode">The HTTP status code to return.</param>
    public AppException(string message, IEnumerable<string> errors, HttpStatusCode statusCode = HttpStatusCode.BadRequest)
        : base(message)
    {
        StatusCode = statusCode;
        Errors = errors.ToList().AsReadOnly();
    }
}
