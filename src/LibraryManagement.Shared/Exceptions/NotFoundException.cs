using System.Net;

namespace LibraryManagement.Shared.Exceptions;

/// <summary>
/// Thrown when a requested resource cannot be found in the data store.
/// Maps to HTTP 404 Not Found.
/// </summary>
public class NotFoundException : AppException
{
    /// <summary>
    /// Initializes a new <see cref="NotFoundException"/> for a specific resource and identifier.
    /// </summary>
    /// <param name="resourceName">The name of the resource type (e.g., "Book", "User").</param>
    /// <param name="id">The identifier that was searched for.</param>
    public NotFoundException(string resourceName, object id)
        : base($"{resourceName} with id '{id}' was not found.", HttpStatusCode.NotFound) { }

    /// <summary>
    /// Initializes a new <see cref="NotFoundException"/> with a custom message.
    /// </summary>
    /// <param name="message">The descriptive error message.</param>
    public NotFoundException(string message)
        : base(message, HttpStatusCode.NotFound) { }
}
