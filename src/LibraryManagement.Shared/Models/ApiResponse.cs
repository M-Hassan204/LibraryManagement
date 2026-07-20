namespace LibraryManagement.Shared.Models;

/// <summary>
/// Standard API response envelope used by all endpoints in the system.
/// Ensures consumers always receive a consistent response structure,
/// regardless of whether the request succeeded or failed.
/// </summary>
/// <typeparam name="T">The type of the data payload returned on success.</typeparam>
public class ApiResponse<T>
{
    /// <summary>
    /// Gets or sets whether the request was processed successfully.
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Gets or sets a human-readable message describing the outcome.
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the response payload. Null on failure.
    /// </summary>
    public T? Data { get; set; }

    /// <summary>
    /// Gets or sets a list of validation or business logic errors.
    /// Populated only when <see cref="Success"/> is <c>false</c>.
    /// </summary>
    public List<string>? Errors { get; set; }

    /// <summary>
    /// Gets or sets the UTC timestamp at which this response was generated.
    /// </summary>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    // ----- Factory Methods -----

    /// <summary>
    /// Creates a successful response with a data payload.
    /// </summary>
    /// <param name="data">The response payload.</param>
    /// <param name="message">Optional success message.</param>
    public static ApiResponse<T> SuccessResponse(T data, string message = "Request completed successfully.")
        => new() { Success = true, Message = message, Data = data };

    /// <summary>
    /// Creates a successful response without a data payload.
    /// </summary>
    /// <param name="message">The success message.</param>
    public static ApiResponse<T> SuccessResponse(string message = "Request completed successfully.")
        => new() { Success = true, Message = message };

    /// <summary>
    /// Creates a failure response with a single error message.
    /// </summary>
    /// <param name="message">The error message.</param>
    public static ApiResponse<T> FailureResponse(string message)
        => new() { Success = false, Message = message, Errors = [message] };

    /// <summary>
    /// Creates a failure response with multiple error messages.
    /// </summary>
    /// <param name="message">A summary message.</param>
    /// <param name="errors">The detailed list of errors.</param>
    public static ApiResponse<T> FailureResponse(string message, List<string> errors)
        => new() { Success = false, Message = message, Errors = errors };
}

/// <summary>
/// Non-generic variant of <see cref="ApiResponse{T}"/> for endpoints that return no payload.
/// </summary>
public class ApiResponse : ApiResponse<object>
{
    /// <summary>Creates a successful response with no payload.</summary>
    public static ApiResponse Ok(string message = "Request completed successfully.")
        => new() { Success = true, Message = message };

    /// <summary>Creates a failure response with a single error message.</summary>
    public static new ApiResponse FailureResponse(string message)
        => new() { Success = false, Message = message, Errors = [message] };
}
