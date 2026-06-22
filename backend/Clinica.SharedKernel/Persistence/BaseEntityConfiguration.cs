using Clinica.SharedKernel.Abstractions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.SharedKernel.Persistence;

public abstract class BaseEntityConfiguration<TEntity>
    : IEntityTypeConfiguration<TEntity>
    where TEntity : AuditableEntity
{
    public virtual void Configure(
        EntityTypeBuilder<TEntity> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.Property(x => x.IsDeleted)
            .HasDefaultValue(false);
    }
}