using Clinica.Api.Modules.Almacenes.TipoMovimientoInventario.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public sealed class TipoMovimientoInventarioConfiguration
    : AuditableEntityConfiguration<TipoMovimientoInventario>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<TipoMovimientoInventario> builder)
    {
        builder.ToTable("TiposMovimientoInventario");

        builder.Property(x => x.Codigo)
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(x => x.Nombre)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Descripcion)
            .HasMaxLength(250);

        builder.Property(x => x.Naturaleza)
            .IsRequired();

        builder.HasIndex(x => x.Codigo)
            .IsUnique();
    }
}
