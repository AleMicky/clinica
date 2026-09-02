using Clinica.Api.Modules.Compras.RecepcionCompra.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Compras;

public sealed class RecepcionCompraDetalleConfiguration
    : AuditableEntityConfiguration<RecepcionCompraDetalle>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<RecepcionCompraDetalle> builder)
    {
        builder.ToTable("RecepcionesCompraDetalles");

        builder.Property(x => x.CantidadRecibida)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.PrecioUnitario)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(x => x.Observacion)
            .HasMaxLength(250);

        builder.HasOne(x => x.OrdenCompraDetalle)
            .WithMany()
            .HasForeignKey(x => x.OrdenCompraDetalleId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Producto)
            .WithMany()
            .HasForeignKey(x => x.ProductoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Lote)
            .WithMany()
            .HasForeignKey(x => x.LoteId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.RecepcionCompra)
            .WithMany(x => x.Detalles)
            .HasForeignKey(x => x.RecepcionCompraId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
