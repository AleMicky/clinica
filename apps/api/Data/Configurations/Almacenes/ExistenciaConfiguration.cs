using Clinica.Api.Modules.Almacenes.Existencia.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Almacenes;

public sealed class ExistenciaConfiguration
    : AuditableEntityConfiguration<Existencia>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<Existencia> builder)
    {
        builder.ToTable("Existencias");

        builder.Property(x => x.Cantidad)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.CantidadReservada)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.CostoPromedio)
            .HasPrecision(18, 2)
            .HasDefaultValue(0)
            .IsRequired();

        builder.Ignore(x => x.CantidadDisponible);
        builder.Ignore(x => x.ValorInventario);

        builder.HasIndex(x => new { x.AlmacenId, x.ProductoId })
            .IsUnique();

        builder.HasOne(x => x.Almacen)
            .WithMany()
            .HasForeignKey(x => x.AlmacenId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Producto)
            .WithMany()
            .HasForeignKey(x => x.ProductoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.ExistenciasPartidas)
            .WithOne(x => x.Existencia)
            .HasForeignKey(x => x.ExistenciaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
