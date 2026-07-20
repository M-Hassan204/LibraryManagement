using LibraryManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LibraryManagement.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity Framework Core Fluent API configuration for the <see cref="Author"/> entity.
/// </summary>
public class AuthorConfiguration : IEntityTypeConfiguration<Author>
{
    /// <inheritdoc />
    public void Configure(EntityTypeBuilder<Author> builder)
    {
        builder.ToTable("Authors");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.Bio)
            .HasMaxLength(2000);

        builder.Property(a => a.Nationality)
            .HasMaxLength(100);

        builder.Property(a => a.CreatedAt)
            .IsRequired();

        // Index for name-based searches
        builder.HasIndex(a => new { a.FirstName, a.LastName })
            .HasDatabaseName("IX_Authors_FullName");

        // Ignore computed property — not mapped to a column
        builder.Ignore(a => a.FullName);
    }
}
