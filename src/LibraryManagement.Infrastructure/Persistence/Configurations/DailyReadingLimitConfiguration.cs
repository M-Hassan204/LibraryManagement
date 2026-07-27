using LibraryManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LibraryManagement.Infrastructure.Persistence.Configurations;

public class DailyReadingLimitConfiguration : IEntityTypeConfiguration<DailyReadingLimit>
{
    public void Configure(EntityTypeBuilder<DailyReadingLimit> builder)
    {
        builder.HasKey(d => d.Id);

        builder.Property(d => d.Date)
            .HasColumnType("date")
            .IsRequired();

        builder.HasOne(d => d.User)
            .WithMany(u => u.DailyReadingLimits)
            .HasForeignKey(d => d.UserId)
            .OnDelete(DeleteBehavior.Cascade);

    }
}
