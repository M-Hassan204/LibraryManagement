using LibraryManagement.Application.Interfaces.Repositories;
using LibraryManagement.Domain.Entities;
using LibraryManagement.Infrastructure.Persistence;

namespace LibraryManagement.Infrastructure.Repositories;

/// <summary>
/// Concrete Unit of Work implementation that coordinates all repositories
/// and exposes a single <see cref="SaveChangesAsync"/> boundary.
/// Uses lazy initialization for repositories to avoid allocating unused instances.
/// </summary>
public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    // Lazily initialized repository instances
    private IGenericRepository<Book>? _books;
    private IGenericRepository<Author>? _authors;
    private IGenericRepository<Category>? _categories;
    private IGenericRepository<BorrowingRecord>? _borrowingRecords;
    private IGenericRepository<RefreshToken>? _refreshTokens;
    private IGenericRepository<OtpCode>? _otpCodes;
    private IGenericRepository<EmailVerificationToken>? _emailVerificationTokens;

    /// <summary>
    /// Initializes a new instance of <see cref="UnitOfWork"/>.
    /// </summary>
    /// <param name="context">The EF Core database context injected by DI.</param>
    public UnitOfWork(AppDbContext context)
    {
        _context = context;
    }

    /// <inheritdoc />
    public IGenericRepository<Book> Books
        => _books ??= new GenericRepository<Book>(_context);

    /// <inheritdoc />
    public IGenericRepository<Author> Authors
        => _authors ??= new GenericRepository<Author>(_context);

    /// <inheritdoc />
    public IGenericRepository<Category> Categories
        => _categories ??= new GenericRepository<Category>(_context);

    /// <inheritdoc />
    public IGenericRepository<BorrowingRecord> BorrowingRecords
        => _borrowingRecords ??= new GenericRepository<BorrowingRecord>(_context);

    /// <inheritdoc />
    public IGenericRepository<RefreshToken> RefreshTokens
        => _refreshTokens ??= new GenericRepository<RefreshToken>(_context);

    /// <inheritdoc />
    public IGenericRepository<OtpCode> OtpCodes
        => _otpCodes ??= new GenericRepository<OtpCode>(_context);

    /// <inheritdoc />
    public IGenericRepository<EmailVerificationToken> EmailVerificationTokens
        => _emailVerificationTokens ??= new GenericRepository<EmailVerificationToken>(_context);

    /// <inheritdoc />
    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => await _context.SaveChangesAsync(cancellationToken);

    /// <inheritdoc />
    public async ValueTask DisposeAsync()
    {
        await _context.DisposeAsync();
        GC.SuppressFinalize(this);
    }
}
