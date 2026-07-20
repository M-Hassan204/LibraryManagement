using System.Linq.Expressions;

namespace LibraryManagement.Application.Interfaces.Repositories;

/// <summary>
/// Defines a generic repository contract for basic CRUD operations and query capabilities.
/// Follows the Repository Pattern to abstract data access from the application layer.
/// </summary>
/// <typeparam name="T">The entity type managed by this repository.</typeparam>
public interface IGenericRepository<T> where T : class
{
    /// <summary>
    /// Retrieves an entity by its integer primary key.
    /// </summary>
    /// <param name="id">The entity's primary key value.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The entity, or <c>null</c> if not found.</returns>
    Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves all entities of type <typeparamref name="T"/>.
    /// Uses <c>AsNoTracking</c> for read performance.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves all entities matching the provided predicate.
    /// </summary>
    /// <param name="predicate">The filter expression.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns the first entity matching the predicate, or <c>null</c>.
    /// </summary>
    /// <param name="predicate">The filter expression.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns whether any entity satisfies the predicate.
    /// </summary>
    /// <param name="predicate">The filter expression.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task<bool> AnyAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns the count of entities satisfying the predicate.
    /// </summary>
    /// <param name="predicate">The filter expression.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns an <see cref="IQueryable{T}"/> for building custom queries with full EF capabilities.
    /// Use this when pagination, ordering, or complex projections are required.
    /// </summary>
    IQueryable<T> Query();

    /// <summary>
    /// Adds a new entity to the context (does not commit to the database).
    /// Call <see cref="IUnitOfWork.SaveChangesAsync"/> to persist.
    /// </summary>
    /// <param name="entity">The entity to add.</param>
    Task AddAsync(T entity, CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a range of new entities to the context.
    /// </summary>
    /// <param name="entities">The entities to add.</param>
    Task AddRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default);

    /// <summary>
    /// Marks an entity as modified (does not commit to the database).
    /// </summary>
    /// <param name="entity">The entity to update.</param>
    void Update(T entity);

    /// <summary>
    /// Marks an entity for hard deletion from the context (does not commit).
    /// For soft-delete, update the <c>IsDeleted</c> flag and call <see cref="Update"/>.
    /// </summary>
    /// <param name="entity">The entity to delete.</param>
    void Delete(T entity);

    /// <summary>
    /// Marks a range of entities for deletion.
    /// </summary>
    /// <param name="entities">The entities to delete.</param>
    void DeleteRange(IEnumerable<T> entities);
}
