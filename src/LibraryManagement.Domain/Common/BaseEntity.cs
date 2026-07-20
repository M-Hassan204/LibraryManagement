namespace LibraryManagement.Domain.Common;

/// <summary>
/// Abstract base entity that provides common auditing fields for all domain entities.
/// Every entity in the system inherits from this class to ensure consistent
/// tracking of creation and modification timestamps.
/// </summary>
public abstract class BaseEntity
{
    /// <summary>
    /// Gets or sets the primary key of the entity.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the UTC timestamp when this entity was created.
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Gets or sets the UTC timestamp when this entity was last updated.
    /// Null until the entity is first modified after creation.
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// Gets or sets whether this entity has been soft-deleted.
    /// Soft-deleted entities are excluded from standard queries but retained in the database.
    /// </summary>
    public bool IsDeleted { get; set; } = false;
}
