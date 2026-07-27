using LibraryManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LibraryManagement.Infrastructure.Persistence.Configurations;

public class LibraryBranchConfiguration : IEntityTypeConfiguration<LibraryBranch>
{
    public void Configure(EntityTypeBuilder<LibraryBranch> builder)
    {
        builder.HasKey(b => b.Id);

        builder.Property(b => b.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(b => b.Governorate)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(b => b.City)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(b => b.Address)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(b => b.Phone)
            .HasMaxLength(20);

        builder.Property(b => b.WorkingHours)
            .HasMaxLength(100);
    }
}
