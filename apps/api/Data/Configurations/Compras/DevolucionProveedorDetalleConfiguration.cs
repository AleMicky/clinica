using Clinica.Api.Modules.Compras.DevolucionProveedor.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Compras;

public sealed class DevolucionProveedorDetalleConfiguration
    : AuditableEntityConfiguration<DevolucionProveedorDetalle>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<DevolucionProveedorDetalle> builder)
    {
        builder.ToTable("DevolucionesProveedorDetalles");

        builder.Property(x => x.Cantidad)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(x => x.Motivo)
            .HasMaxLength(500);

        builder.Property(x => x.Observacion)
            .HasMaxLength(500);

        builder.HasOne(x => x.DevolucionProveedor)
            .WithMany(x => x.Detalles)
            .HasForeignKey(x => x.DevolucionProveedorId)
            .OnDelete(DeleteBehavior.Cascade);

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
