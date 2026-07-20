using LibraryManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LibraryManagement.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity Framework Core Fluent API configuration for the <see cref="OtpCode"/> entity.
/// </summary>
public class OtpCodeConfiguration : IEntityTypeConfiguration<OtpCode>
{
    /// <inheritdoc />
    public void Configure(EntityTypeBuilder<OtpCode> builder)
    {
        builder.ToTable("OtpCodes");

        builder.HasKey(o => o.Id);

        builder.Property(o => o.UserId)
            .IsRequired()
            .HasMaxLength(450);

        builder.Property(o => o.Code)
            .IsRequired()
            .HasMaxLength(6);

        builder.Property(o => o.Purpose)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(o => o.ExpiresAt)
            .IsRequired();

        builder.Property(o => o.CreatedAt)
            .IsRequired();

        // Ignore computed property
        builder.Ignore(o => o.IsValid);

        // Index for fast OTP lookup
        builder.HasIndex(o => new { o.UserId, o.Purpose, o.IsUsed })
            .HasDatabaseName("IX_OtpCodes_UserId_Purpose_IsUsed");

        // Relationship
        builder.HasOne(o => o.User)
            .WithMany(u => u.OtpCodes)
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
