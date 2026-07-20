using LibraryManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LibraryManagement.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity Framework Core Fluent API configuration for the <see cref="BorrowingRecord"/> entity.
/// </summary>
public class BorrowingRecordConfiguration : IEntityTypeConfiguration<BorrowingRecord>
{
    /// <inheritdoc />
    public void Configure(EntityTypeBuilder<BorrowingRecord> builder)
    {
        builder.ToTable("BorrowingRecords");

        builder.HasKey(br => br.Id);

        builder.Property(br => br.UserId)
            .IsRequired()
            .HasMaxLength(450); // Identity PK size

        builder.Property(br => br.BorrowedAt)
            .IsRequired();

        builder.Property(br => br.DueDate)
            .IsRequired();

        builder.Property(br => br.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(br => br.Notes)
            .HasMaxLength(1000);

        // Index for user's borrowing history queries
        builder.HasIndex(br => br.UserId)
            .HasDatabaseName("IX_BorrowingRecords_UserId");

        // Index for overdue detection queries
        builder.HasIndex(br => new { br.Status, br.DueDate })
            .HasDatabaseName("IX_BorrowingRecords_Status_DueDate");

        // Relationship: BorrowingRecord → ApplicationUser (Many-to-One)
        builder.HasOne(br => br.User)
            .WithMany(u => u.BorrowingRecords)
            .HasForeignKey(br => br.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Relationship: BorrowingRecord → Book (Many-to-One)
        builder.HasOne(br => br.Book)
            .WithMany(b => b.BorrowingRecords)
            .HasForeignKey(br => br.BookId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
