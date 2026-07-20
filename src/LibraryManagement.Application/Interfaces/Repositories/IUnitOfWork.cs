using LibraryManagement.Domain.Entities;

namespace LibraryManagement.Application.Interfaces.Repositories;

/// <summary>
/// Unit of Work interface that groups all repositories under a single transaction boundary.
/// Ensures all changes made through repositories in one logical operation are either
/// all committed or all rolled back together.
/// </summary>
public interface IUnitOfWork : IAsyncDisposable
{
    /// <summary>Gets the repository for <see cref="Book"/> entities.</summary>
    IGenericRepository<Book> Books { get; }

    /// <summary>Gets the repository for <see cref="Author"/> entities.</summary>
    IGenericRepository<Author> Authors { get; }

    /// <summary>Gets the repository for <see cref="Category"/> entities.</summary>
    IGenericRepository<Category> Categories { get; }

    /// <summary>Gets the repository for <see cref="BorrowingRecord"/> entities.</summary>
    IGenericRepository<BorrowingRecord> BorrowingRecords { get; }

    /// <summary>Gets the repository for <see cref="RefreshToken"/> entities.</summary>
    IGenericRepository<RefreshToken> RefreshTokens { get; }

    /// <summary>Gets the repository for <see cref="OtpCode"/> entities.</summary>
    IGenericRepository<OtpCode> OtpCodes { get; }

    /// <summary>Gets the repository for <see cref="EmailVerificationToken"/> entities.</summary>
    IGenericRepository<EmailVerificationToken> EmailVerificationTokens { get; }

    /// <summary>
    /// Commits all pending changes tracked by this unit of work to the database.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The number of affected rows.</returns>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
