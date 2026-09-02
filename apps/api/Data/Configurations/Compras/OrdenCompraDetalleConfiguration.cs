using Clinica.Api.Modules.Compras.OrdenCompra.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Compras;

public sealed class OrdenCompraDetalleConfiguration
    : AuditableEntityConfiguration<OrdenCompraDetalle>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<OrdenCompraDetalle> builder)
    {
        builder.ToTable("OrdenesCompraDetalles");

        builder.Property(x => x.Cantidad)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.CantidadRecibida)
            .HasPrecision(18, 2);

        builder.Property(x => x.PrecioUnitario)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(x => x.Descuento)
            .HasPrecision(5, 2);

        builder.Property(x => x.Subtotal)
            .HasPrecision(18, 2);

        builder.Property(x => x.Observacion)
            .HasMaxLength(250);

        builder.HasOne(x => x.Producto)
            .WithMany()
            .HasForeignKey(x => x.ProductoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.OrdenCompra)
            .WithMany(x => x.Detalles)
            .HasForeignKey(x => x.OrdenCompraId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
