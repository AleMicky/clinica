using Clinica.Api.Modules.Almacenes.TransferenciaAlmacen.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public sealed class TransferenciaAlmacenDetalleConfiguration
    : AuditableEntityConfiguration<TransferenciaAlmacenDetalle>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<TransferenciaAlmacenDetalle> builder)
    {
        builder.ToTable("TransferenciasAlmacenDetalles");

        builder.Property(x => x.CantidadSolicitada)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.CantidadAprobada)
            .HasPrecision(18, 2);

        builder.Property(x => x.CantidadDespachada)
            .HasPrecision(18, 2);

        builder.Property(x => x.CantidadRecibida)
            .HasPrecision(18, 2);

        builder.HasOne(x => x.Producto)
            .WithMany()
            .HasForeignKey(x => x.ProductoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Lote)
            .WithMany()
            .HasForeignKey(x => x.LoteId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.TransferenciaAlmacen)
            .WithMany(x => x.Detalles)
            .HasForeignKey(x => x.TransferenciaAlmacenId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
