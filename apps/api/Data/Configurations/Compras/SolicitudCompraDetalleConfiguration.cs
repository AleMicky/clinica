using Clinica.Api.Modules.Compras.SolicitudCompra.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Compras;

public sealed class SolicitudCompraDetalleConfiguration
    : AuditableEntityConfiguration<SolicitudCompraDetalle>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<SolicitudCompraDetalle> builder)
    {
        builder.ToTable("SolicitudesCompraDetalles");

        builder.Property(x => x.CantidadSolicitada)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.CantidadAprobada)
            .HasPrecision(18, 2);

        builder.Property(x => x.Observacion)
            .HasMaxLength(250);

        builder.HasOne(x => x.Producto)
            .WithMany()
            .HasForeignKey(x => x.ProductoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.SolicitudCompra)
            .WithMany(x => x.Detalles)
            .HasForeignKey(x => x.SolicitudCompraId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
