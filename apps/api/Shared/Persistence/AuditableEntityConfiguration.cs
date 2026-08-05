using Clinica.Api.Shared.Abstractions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Shared.Persistence;

public abstract class AuditableEntityConfiguration<TEntity>
    : IEntityTypeConfiguration<TEntity>
    where TEntity : AuditableEntity
{
    public void Configure(EntityTypeBuilder<TEntity> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();
        builder.Property(x => x.FechaCreacion).IsRequired();
        builder.Property(x => x.CreadoPor).HasMaxLength(100);
        builder.Property(x => x.FechaModificacion);
        builder.Property(x => x.ModificadoPor).HasMaxLength(100);
        builder.Property(x => x.Activo).HasDefaultValue(true);
        ConfigureEntity(builder);
    }

    protected abstract void ConfigureEntity(EntityTypeBuilder<TEntity> builder);
}