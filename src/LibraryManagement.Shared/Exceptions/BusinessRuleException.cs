using System.Net;

namespace LibraryManagement.Shared.Exceptions;

/// <summary>
/// Thrown when a business rule is violated that does not fit other specific exception types.
/// Examples: borrowing limit exceeded, book not available, OTP already used.
/// Maps to HTTP 400 Bad Request.
/// </summary>
public class BusinessRuleException : AppException
{
    /// <summary>
    /// Initializes a new <see cref="BusinessRuleException"/> with the violated rule message.
    /// </summary>
    /// <param name="message">The description of the violated business rule.</param>
    public BusinessRuleException(string message)
        : base(message, HttpStatusCode.BadRequest) { }
}
