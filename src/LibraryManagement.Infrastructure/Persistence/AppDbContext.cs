using LibraryManagement.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagement.Infrastructure.Persistence;

/// <summary>
/// The main Entity Framework Core database context for the Library Management System.
/// Extends <see cref="IdentityDbContext{TUser}"/> to inherit all Identity tables
/// (AspNetUsers, AspNetRoles, AspNetUserRoles, etc.) and adds domain-specific DbSets.
/// </summary>
public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    /// <summary>
    /// Initializes a new instance of <see cref="AppDbContext"/>.
    /// </summary>
    /// <param name="options">The options to be used by a <see cref="DbContext"/>.</param>
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // ----- Domain DbSets -----

    /// <summary>Gets or sets the Authors table.</summary>
    public DbSet<Author> Authors { get; set; }

    /// <summary>Gets or sets the Categories table.</summary>
    public DbSet<Category> Categories { get; set; }

    /// <summary>Gets or sets the Books table.</summary>
    public DbSet<Book> Books { get; set; }

    /// <summary>Gets or sets the BorrowingRecords table.</summary>
    public DbSet<BorrowingRecord> BorrowingRecords { get; set; }

    /// <summary>Gets or sets the RefreshTokens table.</summary>
    public DbSet<RefreshToken> RefreshTokens { get; set; }

    /// <summary>Gets or sets the OtpCodes table.</summary>
    public DbSet<OtpCode> OtpCodes { get; set; }

    /// <summary>Gets or sets the EmailVerificationTokens table.</summary>
    public DbSet<EmailVerificationToken> EmailVerificationTokens { get; set; }

    /// <inheritdoc />
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Apply all entity configurations from the current assembly
        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // Rename Identity tables to cleaner names
        builder.Entity<ApplicationUser>().ToTable("Users");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityRole>().ToTable("Roles");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserRole<string>>().ToTable("UserRoles");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserClaim<string>>().ToTable("UserClaims");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserLogin<string>>().ToTable("UserLogins");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>>().ToTable("RoleClaims");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserToken<string>>().ToTable("UserTokens");

        // Global query filter — exclude soft-deleted entities from all queries
        builder.Entity<Author>().HasQueryFilter(a => !a.IsDeleted);
        builder.Entity<Category>().HasQueryFilter(c => !c.IsDeleted);
        builder.Entity<Book>().HasQueryFilter(b => !b.IsDeleted);
        builder.Entity<BorrowingRecord>().HasQueryFilter(br => !br.IsDeleted);
        builder.Entity<ApplicationUser>().HasQueryFilter(u => !u.IsDeleted);
    }
}
