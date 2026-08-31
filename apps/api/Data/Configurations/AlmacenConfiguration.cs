using Clinica.Api.Modules.Almacenes.Almacen.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public sealed class AlmacenConfiguration
    : AuditableEntityConfiguration<Almacen>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<Almacen> builder)
    {
        builder.ToTable("Almacenes");

        builder.Property(x => x.Codigo)
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(x => x.Nombre)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Descripcion)
            .HasMaxLength(250);

        builder.Property(x => x.Ubicacion)
            .HasMaxLength(250);

        builder.HasIndex(x => x.Codigo)
            .IsUnique();
    }
}
