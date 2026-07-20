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
}
