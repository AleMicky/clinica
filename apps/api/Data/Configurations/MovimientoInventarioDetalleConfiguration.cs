using Clinica.Api.Modules.Almacenes.MovimientoInventario.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public sealed class MovimientoInventarioDetalleConfiguration
    : AuditableEntityConfiguration<MovimientoInventarioDetalle>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<MovimientoInventarioDetalle> builder)
    {
        builder.ToTable("MovimientosInventarioDetalles");

        builder.Property(x => x.Cantidad)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.CostoUnitario)
            .HasPrecision(18, 2);

        builder.HasOne(x => x.Producto)
            .WithMany()
            .HasForeignKey(x => x.ProductoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Lote)
            .WithMany()
            .HasForeignKey(x => x.LoteId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.MovimientoInventario)
            .WithMany(x => x.Detalles)
            .HasForeignKey(x => x.MovimientoInventarioId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
