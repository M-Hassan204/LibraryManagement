using LibraryManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LibraryManagement.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity Framework Core Fluent API configuration for the <see cref="Book"/> entity.
/// Defines column types, constraints, indexes, and relationships.
/// </summary>
public class BookConfiguration : IEntityTypeConfiguration<Book>
{
    /// <inheritdoc />
    public void Configure(EntityTypeBuilder<Book> builder)
    {
        builder.ToTable("Books");

        builder.HasKey(b => b.Id);

        builder.Property(b => b.Title)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(b => b.ISBN)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(b => b.Description)
            .HasMaxLength(2000);

        builder.Property(b => b.Publisher)
            .HasMaxLength(200);

        builder.Property(b => b.Language)
            .IsRequired()
            .HasMaxLength(50)
            .HasDefaultValue("English");

        builder.Property(b => b.CoverImageUrl)
            .HasMaxLength(500);

        builder.Property(b => b.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(b => b.TotalCopies)
            .IsRequired()
            .HasDefaultValue(1);

        builder.Property(b => b.AvailableCopies)
            .IsRequired()
            .HasDefaultValue(1);

        builder.Property(b => b.CreatedAt)
            .IsRequired();

        // Unique constraint on ISBN
        builder.HasIndex(b => b.ISBN)
            .IsUnique()
            .HasDatabaseName("IX_Books_ISBN");

        // Index on Title for search performance
        builder.HasIndex(b => b.Title)
            .HasDatabaseName("IX_Books_Title");

        // Relationship: Book → Author (Many-to-One)
        builder.HasOne(b => b.Author)
            .WithMany(a => a.Books)
            .HasForeignKey(b => b.AuthorId)
            .OnDelete(DeleteBehavior.Restrict);

        // Relationship: Book → Category (Many-to-One)
        builder.HasOne(b => b.Category)
            .WithMany(c => c.Books)
            .HasForeignKey(b => b.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
