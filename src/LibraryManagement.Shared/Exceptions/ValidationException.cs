using System.Net;

namespace LibraryManagement.Shared.Exceptions;

/// <summary>
/// Thrown when a request fails one or more FluentValidation rules.
/// Maps to HTTP 422 Unprocessable Entity, which is semantically more
/// accurate than 400 for validation failures.
/// </summary>
public class ValidationException : AppException
{
    /// <summary>
    /// Initializes a new <see cref="ValidationException"/> with a list of validation errors.
    /// </summary>
    /// <param name="errors">The list of validation failure messages.</param>
    public ValidationException(IEnumerable<string> errors)
        : base("One or more validation errors occurred.", errors, HttpStatusCode.UnprocessableEntity) { }

    /// <summary>
    /// Initializes a new <see cref="ValidationException"/> with a single error message.
    /// </summary>
    /// <param name="message">The validation error description.</param>
    public ValidationException(string message)
        : base(message, HttpStatusCode.UnprocessableEntity) { }
}
