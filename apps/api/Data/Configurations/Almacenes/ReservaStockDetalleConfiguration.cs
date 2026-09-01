using Clinica.Api.Modules.Almacenes.ReservaStock.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Almacenes;

public sealed class ReservaStockDetalleConfiguration
    : AuditableEntityConfiguration<ReservaStockDetalle>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<ReservaStockDetalle> builder)
    {
        builder.ToTable("ReservasStockDetalles");

        builder.Property(x => x.CantidadReservada)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.CantidadConsumida)
            .HasPrecision(18, 2)
            .HasDefaultValue(0);

        builder.HasOne(x => x.Producto)
            .WithMany()
            .HasForeignKey(x => x.ProductoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Lote)
            .WithMany()
            .HasForeignKey(x => x.LoteId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ReservaStock)
            .WithMany(x => x.Detalles)
            .HasForeignKey(x => x.ReservaStockId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
