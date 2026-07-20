using System.Net;

namespace LibraryManagement.Shared.Exceptions;

/// <summary>
/// Thrown when an operation would create a duplicate or conflicting state
/// in the system (e.g., registering with an already-used email).
/// Maps to HTTP 409 Conflict.
/// </summary>
public class ConflictException : AppException
{
    /// <summary>
    /// Initializes a new <see cref="ConflictException"/> with a custom message.
    /// </summary>
    /// <param name="message">The descriptive conflict description.</param>
    public ConflictException(string message)
        : base(message, HttpStatusCode.Conflict) { }

    /// <summary>
    /// Initializes a new <see cref="ConflictException"/> for a specific conflicting field.
    /// </summary>
    /// <param name="resourceName">The resource that is conflicting (e.g., "User").</param>
    /// <param name="fieldName">The field that caused the conflict (e.g., "Email").</param>
    /// <param name="value">The conflicting value.</param>
    public ConflictException(string resourceName, string fieldName, object value)
        : base($"{resourceName} with {fieldName} '{value}' already exists.", HttpStatusCode.Conflict) { }
}
