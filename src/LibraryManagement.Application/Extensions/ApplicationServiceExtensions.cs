using System.Reflection;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace LibraryManagement.Application.Extensions;

/// <summary>
/// Extension methods for registering Application-layer services into the DI container.
/// </summary>
public static class ApplicationServiceExtensions
{
    /// <summary>
    /// Registers AutoMapper, FluentValidation, and Application Services.
    /// </summary>
    /// <param name="services">The service collection.</param>
    /// <returns>The updated service collection.</returns>
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        // Register AutoMapper mappings (AutoMapper 16.x signature)
        services.AddAutoMapper(cfg => { }, assembly);

        // Register FluentValidation validators
        services.AddValidatorsFromAssembly(assembly);

        // Register Business Services
        services.AddScoped<LibraryManagement.Application.Interfaces.Services.IAuthService, LibraryManagement.Application.Services.AuthService>();
        services.AddScoped<LibraryManagement.Application.Interfaces.Services.IOtpService, LibraryManagement.Application.Services.OtpService>();
        services.AddScoped<LibraryManagement.Application.Interfaces.Services.ICategoryService, LibraryManagement.Application.Services.CategoryService>();
        services.AddScoped<LibraryManagement.Application.Interfaces.Services.IAuthorService, LibraryManagement.Application.Services.AuthorService>();
        services.AddScoped<LibraryManagement.Application.Interfaces.Services.IBookService, LibraryManagement.Application.Services.BookService>();
        services.AddScoped<LibraryManagement.Application.Interfaces.Services.IUserService, LibraryManagement.Application.Services.UserService>();
        services.AddScoped<LibraryManagement.Application.Interfaces.Services.IAdminUserService, LibraryManagement.Application.Services.AdminUserService>();
        services.AddScoped<LibraryManagement.Application.Interfaces.Services.IBorrowingService, LibraryManagement.Application.Services.BorrowingService>();
        services.AddScoped<LibraryManagement.Application.Interfaces.Services.IImageService, LibraryManagement.Application.Services.ImageService>();
        services.AddScoped<LibraryManagement.Application.Interfaces.Services.IDashboardService, LibraryManagement.Application.Services.DashboardService>();
        services.AddScoped<LibraryManagement.Application.Interfaces.Services.IBookMetadataService, LibraryManagement.Application.Services.BookMetadataService>();
        services.AddScoped<LibraryManagement.Application.Interfaces.Services.ISubscriptionService, LibraryManagement.Application.Services.SubscriptionService>();
        services.AddScoped<LibraryManagement.Application.Interfaces.Services.IReadingService, LibraryManagement.Application.Services.ReadingService>();
        services.AddScoped<LibraryManagement.Application.Interfaces.Services.IDeliveryService, LibraryManagement.Application.Services.DeliveryService>();
        services.AddScoped<LibraryManagement.Application.Interfaces.Services.IFavoriteBookService, LibraryManagement.Application.Services.FavoriteBookService>();
        services.AddScoped<LibraryManagement.Application.Interfaces.Services.IDailyRecommendationService, LibraryManagement.Application.Services.DailyRecommendationService>();

        // Register HttpClient for external API calls
        services.AddHttpClient();

        return services;
    }
}
