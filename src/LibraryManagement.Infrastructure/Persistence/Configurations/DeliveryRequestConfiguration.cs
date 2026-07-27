using LibraryManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LibraryManagement.Infrastructure.Persistence.Configurations;

public class DeliveryRequestConfiguration : IEntityTypeConfiguration<DeliveryRequest>
{
    public void Configure(EntityTypeBuilder<DeliveryRequest> builder)
    {
        builder.HasKey(d => d.Id);

        builder.Property(d => d.DeliveryAddress)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(d => d.Status)
            .IsRequired();

        builder.Property(d => d.RequestedDate)
            .IsRequired();

        builder.HasOne(d => d.User)
            .WithMany(u => u.DeliveryRequests)
            .HasForeignKey(d => d.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(d => d.Book)
            .WithMany()
            .HasForeignKey(d => d.BookId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(d => d.BorrowingRecord)
            .WithMany()
            .HasForeignKey(d => d.BorrowingRecordId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
