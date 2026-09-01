using Clinica.Api.Modules.Almacenes.BajaInventario.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public sealed class BajaInventarioDetalleConfiguration
    : AuditableEntityConfiguration<BajaInventarioDetalle>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<BajaInventarioDetalle> builder)
    {
        builder.ToTable("BajasInventarioDetalles");

        builder.Property(x => x.Cantidad)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.Observacion)
            .HasMaxLength(500);

        builder.HasOne(x => x.Producto)
            .WithMany()
            .HasForeignKey(x => x.ProductoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Lote)
            .WithMany()
            .HasForeignKey(x => x.LoteId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.BajaInventario)
            .WithMany(x => x.Detalles)
            .HasForeignKey(x => x.BajaInventarioId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}