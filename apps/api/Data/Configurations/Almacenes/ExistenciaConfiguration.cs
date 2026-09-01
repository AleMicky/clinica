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

        builder.HasIndex(x => new { x.AlmacenId, x.ProductoId, x.LoteId })
            .IsUnique();

        builder.HasOne(x => x.Almacen)
            .WithMany()
            .HasForeignKey(x => x.AlmacenId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Producto)
            .WithMany()
            .HasForeignKey(x => x.ProductoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Lote)
            .WithMany()
            .HasForeignKey(x => x.LoteId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
