using LibraryManagement.Domain.Constants;
using LibraryManagement.Domain.Entities;
using LibraryManagement.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace LibraryManagement.Infrastructure.Persistence;

/// <summary>
/// Database seeder responsible for creating initial data required for the system to
/// be functional on first startup. This includes default roles, the admin account,
/// sample categories, authors, and books.
///
/// Designed to be idempotent — running it multiple times does not produce duplicates.
/// </summary>
public static class DbSeeder
{
    /// <summary>
    /// Seeds all required initial data into the database.
    /// </summary>
    /// <param name="serviceProvider">The DI service provider from the application scope.</param>
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        var logger = serviceProvider.GetRequiredService<ILogger<AppDbContext>>();

        try
        {
            var context = serviceProvider.GetRequiredService<AppDbContext>();
            var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            // Ensure database is up to date
            await context.Database.MigrateAsync();

            await SeedRolesAsync(roleManager, logger);
            await SeedAdminUserAsync(userManager, logger);
            await SeedCategoriesAsync(context, logger);
            await SeedAuthorsAsync(context, logger);
            await SeedBooksAsync(context, logger);
            await SeedLibraryBranchesAsync(context, logger);
            await SeedSubscriptionsAsync(context, userManager, logger);

            logger.LogInformation("Database seeding completed successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }

    private static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager, ILogger logger)
    {
        var roles = new[] { AppRoles.Admin, AppRoles.Student };

        foreach (var roleName in roles)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole(roleName));
                logger.LogInformation("Created role: {Role}", roleName);
            }
        }
    }

    private static async Task SeedAdminUserAsync(UserManager<ApplicationUser> userManager, ILogger logger)
    {
        const string adminEmail = "admin@libraryms.com";

        if (await userManager.FindByEmailAsync(adminEmail) is not null)
            return;

        var admin = new ApplicationUser
        {
            FirstName = "System",
            LastName = "Administrator",
            UserName = adminEmail,
            Email = adminEmail,
            EmailConfirmed = true,   // Admin is pre-verified
            StudentId = null,
            Department = "IT Department",
            CreatedAt = DateTime.UtcNow
        };

        var result = await userManager.CreateAsync(admin, "Admin@123456!");
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(admin, AppRoles.Admin);
            logger.LogInformation("Admin user created: {Email}", adminEmail);
        }
        else
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            logger.LogError("Failed to create admin user: {Errors}", errors);
        }
    }

    private static async Task SeedCategoriesAsync(AppDbContext context, ILogger logger)
    {
        if (await context.Categories.IgnoreQueryFilters().AnyAsync())
            return;

        var categories = new List<Category>
        {
            new() { Name = "Computer Science", Description = "Books on programming, algorithms, and software engineering." },
            new() { Name = "Mathematics", Description = "Pure and applied mathematics textbooks and references." },
            new() { Name = "Physics", Description = "Classical and modern physics literature." },
            new() { Name = "Literature", Description = "World literature, novels, and poetry collections." },
            new() { Name = "History", Description = "Historical accounts and historical analysis works." },
            new() { Name = "Business & Economics", Description = "Finance, management, and economic theory." },
            new() { Name = "Medicine & Health", Description = "Medical references, anatomy, and health science." },
            new() { Name = "Philosophy", Description = "Classical and contemporary philosophical works." }
        };

        await context.Categories.AddRangeAsync(categories);
        await context.SaveChangesAsync();
        logger.LogInformation("Seeded {Count} categories.", categories.Count);
    }

    private static async Task SeedAuthorsAsync(AppDbContext context, ILogger logger)
    {
        if (await context.Authors.IgnoreQueryFilters().AnyAsync())
            return;

        var authors = new List<Author>
        {
            new() { FirstName = "Robert", LastName = "Martin", Nationality = "American",
                Bio = "Software engineer and author, known as \"Uncle Bob\". Author of Clean Code and The Clean Coder." },
            new() { FirstName = "Martin", LastName = "Fowler", Nationality = "British",
                Bio = "Chief Scientist at ThoughtWorks. Author of Refactoring and Patterns of Enterprise Application Architecture." },
            new() { FirstName = "Donald", LastName = "Knuth", Nationality = "American",
                Bio = "Professor Emeritus at Stanford University and author of the multivolume work The Art of Computer Programming." },
            new() { FirstName = "Andrew", LastName = "Tanenbaum", Nationality = "American",
                Bio = "Professor of Computer Science at Vrije Universiteit, Amsterdam. Author of Modern Operating Systems." },
            new() { FirstName = "George", LastName = "Orwell", Nationality = "British",
                Bio = "English novelist and essayist, known for Animal Farm and Nineteen Eighty-Four." },
            new() { FirstName = "Frank", LastName = "Herbert", Nationality = "American",
                Bio = "Author of the Dune series, considered one of the greatest science fiction works ever written." },
            new() { FirstName = "Stephen", LastName = "Hawking", Nationality = "British",
                Bio = "Theoretical physicist and cosmologist. Author of A Brief History of Time." },
            new() { FirstName = "Eric", LastName = "Evans", Nationality = "American",
                Bio = "Software architect and author of Domain-Driven Design: Tackling Complexity in the Heart of Software." }
        };

        await context.Authors.AddRangeAsync(authors);
        await context.SaveChangesAsync();
        logger.LogInformation("Seeded {Count} authors.", authors.Count);
    }

    private static async Task SeedBooksAsync(AppDbContext context, ILogger logger)
    {
        if (await context.Books.IgnoreQueryFilters().AnyAsync())
            return;

        // Fetch seeded entities to reference their IDs
        var csCategory = await context.Categories.IgnoreQueryFilters().FirstAsync(c => c.Name == "Computer Science");
        var physicsCategory = await context.Categories.IgnoreQueryFilters().FirstAsync(c => c.Name == "Physics");
        var literatureCategory = await context.Categories.IgnoreQueryFilters().FirstAsync(c => c.Name == "Literature");

        var martinAuthor = await context.Authors.IgnoreQueryFilters().FirstAsync(a => a.LastName == "Martin");
        var fowlerAuthor = await context.Authors.IgnoreQueryFilters().FirstAsync(a => a.LastName == "Fowler");
        var knuthAuthor = await context.Authors.IgnoreQueryFilters().FirstAsync(a => a.LastName == "Knuth");
        var tanenbaum = await context.Authors.IgnoreQueryFilters().FirstAsync(a => a.LastName == "Tanenbaum");
        var orwell = await context.Authors.IgnoreQueryFilters().FirstAsync(a => a.LastName == "Orwell");
        var hawking = await context.Authors.IgnoreQueryFilters().FirstAsync(a => a.LastName == "Hawking");
        var evans = await context.Authors.IgnoreQueryFilters().FirstAsync(a => a.LastName == "Evans");

        var books = new List<Book>
        {
            new()
            {
                Title = "Clean Code: A Handbook of Agile Software Craftsmanship",
                ISBN = "9780132350884", Publisher = "Prentice Hall", PublicationYear = 2008,
                Description = "A guide to writing clean, maintainable, and professional code.",
                Language = "English", Pages = 431, TotalCopies = 5, AvailableCopies = 5,
                Status = BookStatus.Available, AuthorId = martinAuthor.Id, CategoryId = csCategory.Id
            },
            new()
            {
                Title = "Refactoring: Improving the Design of Existing Code",
                ISBN = "9780201485677", Publisher = "Addison-Wesley", PublicationYear = 1999,
                Description = "Classic guide to code refactoring techniques with practical examples.",
                Language = "English", Pages = 448, TotalCopies = 3, AvailableCopies = 3,
                Status = BookStatus.Available, AuthorId = fowlerAuthor.Id, CategoryId = csCategory.Id
            },
            new()
            {
                Title = "The Art of Computer Programming, Vol. 1",
                ISBN = "9780201896831", Publisher = "Addison-Wesley", PublicationYear = 1997,
                Description = "The definitive reference on fundamental algorithms and data structures.",
                Language = "English", Pages = 672, TotalCopies = 2, AvailableCopies = 2,
                Status = BookStatus.Available, AuthorId = knuthAuthor.Id, CategoryId = csCategory.Id
            },
            new()
            {
                Title = "Modern Operating Systems",
                ISBN = "9780136006633", Publisher = "Prentice Hall", PublicationYear = 2009,
                Description = "Comprehensive coverage of operating system concepts and implementation.",
                Language = "English", Pages = 1080, TotalCopies = 4, AvailableCopies = 4,
                Status = BookStatus.Available, AuthorId = tanenbaum.Id, CategoryId = csCategory.Id
            },
            new()
            {
                Title = "Nineteen Eighty-Four",
                ISBN = "9780451524935", Publisher = "Signet Classic", PublicationYear = 1949,
                Description = "A dystopian social science fiction novel about totalitarianism.",
                Language = "English", Pages = 328, TotalCopies = 6, AvailableCopies = 6,
                Status = BookStatus.Available, AuthorId = orwell.Id, CategoryId = literatureCategory.Id
            },
            new()
            {
                Title = "A Brief History of Time",
                ISBN = "9780553380163", Publisher = "Bantam Books", PublicationYear = 1988,
                Description = "A landmark science book on cosmology for general readers.",
                Language = "English", Pages = 212, TotalCopies = 4, AvailableCopies = 4,
                Status = BookStatus.Available, AuthorId = hawking.Id, CategoryId = physicsCategory.Id
            },
            new()
            {
                Title = "Domain-Driven Design",
                ISBN = "9780321125217", Publisher = "Addison-Wesley", PublicationYear = 2003,
                Description = "Linking software implementation to an evolving model.",
                Language = "English", Pages = 530, TotalCopies = 3, AvailableCopies = 3,
                Status = BookStatus.Available, AuthorId = evans.Id, CategoryId = csCategory.Id
            }
        };

        await context.Books.AddRangeAsync(books);
        await context.SaveChangesAsync();
        logger.LogInformation("Seeded {Count} books.", books.Count);
    }

    private static async Task SeedLibraryBranchesAsync(AppDbContext context, ILogger logger)
    {
        if (await context.LibraryBranches.IgnoreQueryFilters().AnyAsync())
            return;

        var branches = new List<LibraryBranch>
        {
            new() { Name = "Main Cairo Library", Governorate = "Cairo", City = "Cairo", Address = "15 Tahrir Square, Downtown", Latitude = 30.0444, Longitude = 31.2357, Phone = "02-12345678", WorkingHours = "09:00 AM - 09:00 PM" },
            new() { Name = "Giza Central Library", Governorate = "Giza", City = "Giza", Address = "Dokki, Giza", Latitude = 30.0384, Longitude = 31.2065, Phone = "02-12345679", WorkingHours = "09:00 AM - 09:00 PM" },
            new() { Name = "Alexandrina Library", Governorate = "Alexandria", City = "Alexandria", Address = "Al Azaritah, Alexandria", Latitude = 31.2089, Longitude = 29.9092, Phone = "03-1234567", WorkingHours = "08:00 AM - 10:00 PM" },
            new() { Name = "Mansoura Public Library", Governorate = "Dakahlia", City = "Mansoura", Address = "Gomhouria St, Mansoura", Latitude = 31.0409, Longitude = 31.3785, Phone = "050-1234567", WorkingHours = "09:00 AM - 08:00 PM" },
            new() { Name = "Zagazig Public Library", Governorate = "Sharqia", City = "Zagazig", Address = "Galaa St, Zagazig", Latitude = 30.5877, Longitude = 31.5020, Phone = "055-1234567", WorkingHours = "09:00 AM - 08:00 PM" },
            new() { Name = "Tanta Library", Governorate = "Gharbia", City = "Tanta", Address = "El Geish St, Tanta", Latitude = 30.7865, Longitude = 31.0004, Phone = "040-1234567", WorkingHours = "09:00 AM - 08:00 PM" },
            new() { Name = "Shibin El Kom Library", Governorate = "Monufia", City = "Shibin El Kom", Address = "Gamal Abd El Nasser St", Latitude = 30.5503, Longitude = 31.0106, Phone = "048-1234567", WorkingHours = "09:00 AM - 08:00 PM" },
            new() { Name = "Damanhour Public Library", Governorate = "Beheira", City = "Damanhour", Address = "Abdel Salam El Shazly St", Latitude = 31.0414, Longitude = 30.4727, Phone = "045-1234567", WorkingHours = "09:00 AM - 08:00 PM" },
            new() { Name = "Kafr El Sheikh Library", Governorate = "Kafr El Sheikh", City = "Kafr El Sheikh", Address = "El Nabawy El Mohandes St", Latitude = 31.1107, Longitude = 30.9388, Phone = "047-1234567", WorkingHours = "09:00 AM - 08:00 PM" },
            new() { Name = "Damietta Library", Governorate = "Damietta", City = "Damietta", Address = "El Kornish St", Latitude = 31.4175, Longitude = 31.8144, Phone = "057-1234567", WorkingHours = "09:00 AM - 08:00 PM" },
            new() { Name = "Port Said Library", Governorate = "Port Said", City = "Port Said", Address = "El Gomhouria St", Latitude = 31.2565, Longitude = 32.2841, Phone = "066-1234567", WorkingHours = "09:00 AM - 08:00 PM" },
            new() { Name = "Ismailia Library", Governorate = "Ismailia", City = "Ismailia", Address = "El Geish St", Latitude = 30.5965, Longitude = 32.2715, Phone = "064-1234567", WorkingHours = "09:00 AM - 08:00 PM" },
            new() { Name = "Suez Library", Governorate = "Suez", City = "Suez", Address = "El Geish St", Latitude = 29.9668, Longitude = 32.5498, Phone = "062-1234567", WorkingHours = "09:00 AM - 08:00 PM" },
            new() { Name = "Arish Library", Governorate = "North Sinai", City = "Arish", Address = "23 July St", Latitude = 31.1316, Longitude = 33.7984, Phone = "068-1234567", WorkingHours = "09:00 AM - 08:00 PM" },
            new() { Name = "Sharm El Sheikh Library", Governorate = "South Sinai", City = "Sharm El Sheikh", Address = "Peace Road", Latitude = 27.9158, Longitude = 34.3299, Phone = "069-1234567", WorkingHours = "09:00 AM - 08:00 PM" },
            new() { Name = "Fayoum Library", Governorate = "Fayoum", City = "Fayoum", Address = "Batal El Salam St", Latitude = 29.3084, Longitude = 30.8428, Phone = "084-1234567", WorkingHours = "09:00 AM - 08:00 PM" },
            new() { Name = "Beni Suef Library", Governorate = "Beni Suef", City = "Beni Suef", Address = "El Geish St", Latitude = 29.0661, Longitude = 31.0994, Phone = "082-1234567", WorkingHours = "09:00 AM - 08:00 PM" },
            new() { Name = "Minya Library", Governorate = "Minya", City = "Minya", Address = "El Kornish St", Latitude = 28.0871, Longitude = 30.7618, Phone = "086-1234567", WorkingHours = "09:00 AM - 08:00 PM" },
            new() { Name = "Assiut Library", Governorate = "Assiut", City = "Assiut", Address = "El Gomhouria St", Latitude = 27.1783, Longitude = 31.1859, Phone = "088-1234567", WorkingHours = "09:00 AM - 08:00 PM" },
            new() { Name = "Sohag Library", Governorate = "Sohag", City = "Sohag", Address = "El Geish St", Latitude = 26.5591, Longitude = 31.6957, Phone = "093-1234567", WorkingHours = "09:00 AM - 08:00 PM" },
            new() { Name = "Qena Library", Governorate = "Qena", City = "Qena", Address = "Luxor St", Latitude = 26.1551, Longitude = 32.7160, Phone = "096-1234567", WorkingHours = "09:00 AM - 08:00 PM" },
            new() { Name = "Luxor Library", Governorate = "Luxor", City = "Luxor", Address = "El Kornish St", Latitude = 25.6872, Longitude = 32.6396, Phone = "095-1234567", WorkingHours = "09:00 AM - 08:00 PM" },
            new() { Name = "Aswan Library", Governorate = "Aswan", City = "Aswan", Address = "El Kornish St", Latitude = 24.0889, Longitude = 32.8998, Phone = "097-1234567", WorkingHours = "09:00 AM - 08:00 PM" },
            new() { Name = "Hurghada Library", Governorate = "Red Sea", City = "Hurghada", Address = "Sheraton Road", Latitude = 27.2579, Longitude = 33.8116, Phone = "065-1234567", WorkingHours = "09:00 AM - 08:00 PM" },
            new() { Name = "Marsa Matrouh Library", Governorate = "Matrouh", City = "Marsa Matrouh", Address = "El Geish St", Latitude = 31.3529, Longitude = 27.2362, Phone = "046-1234567", WorkingHours = "09:00 AM - 08:00 PM" },
            new() { Name = "Kharga Library", Governorate = "New Valley", City = "Kharga", Address = "Gamal Abd El Nasser St", Latitude = 25.4390, Longitude = 30.5586, Phone = "092-1234567", WorkingHours = "09:00 AM - 08:00 PM" }
        };

        await context.LibraryBranches.AddRangeAsync(branches);
        await context.SaveChangesAsync();
        logger.LogInformation("Seeded {Count} library branches.", branches.Count);
    }

    private static async Task SeedSubscriptionsAsync(AppDbContext context, UserManager<ApplicationUser> userManager, ILogger logger)
    {
        var usersWithoutSubscription = await userManager.Users
            .Where(u => !context.Subscriptions.Any(s => s.UserId == u.Id))
            .ToListAsync();

        if (usersWithoutSubscription.Any())
        {
            var subscriptions = usersWithoutSubscription.Select(u => new Subscription
            {
                UserId = u.Id,
                Plan = SubscriptionPlanType.Free,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddYears(10), // Free forever effectively, or could be 1 month renewed
                Status = SubscriptionStatus.Active
            }).ToList();

            await context.Subscriptions.AddRangeAsync(subscriptions);
            await context.SaveChangesAsync();
            logger.LogInformation("Seeded free subscriptions for {Count} users.", subscriptions.Count);
        }
    }
}
