using System.Net;
using System.Text.Json;
using LibraryManagement.Shared.Exceptions;
using LibraryManagement.Shared.Models;

namespace LibraryManagement.API.Middlewares;

/// <summary>
/// Global exception handling middleware that intercepts all unhandled exceptions
/// during request processing and transforms them into structured API responses.
///
/// This middleware sits at the top of the pipeline and ensures:
/// - Known <see cref="AppException"/> subclasses map to their designated HTTP status codes.
/// - Unknown exceptions produce a 500 Internal Server Error without leaking stack traces.
/// - All error responses conform to the <see cref="ApiResponse{T}"/> contract.
/// </summary>
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    /// <summary>
    /// Initializes a new instance of <see cref="GlobalExceptionMiddleware"/>.
    /// </summary>
    /// <param name="next">The next middleware in the pipeline.</param>
    /// <param name="logger">The logger instance for structured error logging.</param>
    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    /// <summary>
    /// Invokes the middleware, wrapping the downstream pipeline in a try/catch.
    /// </summary>
    /// <param name="context">The current HTTP context.</param>
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (AppException ex)
        {
            _logger.LogWarning(ex, "Application exception occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex.StatusCode, ex.Errors.ToList());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected server error occurred processing {Method} {Path}",
                context.Request.Method, context.Request.Path);

            await HandleExceptionAsync(
                context,
                HttpStatusCode.InternalServerError,
                ["An unexpected error occurred. Please try again later."]);
        }
    }

    private static async Task HandleExceptionAsync(
        HttpContext context,
        HttpStatusCode statusCode,
        List<string> errors)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var response = ApiResponse<object>.FailureResponse(errors.FirstOrDefault() ?? "An error occurred.", errors);
        var json = JsonSerializer.Serialize(response, JsonOptions);
        await context.Response.WriteAsync(json);
    }
}
