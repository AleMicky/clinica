using Clinica.Api.Modules.Compras.DevolucionProveedor.Entity;
using Clinica.Api.Modules.Compras.DevolucionProveedor.Enums;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Compras;

public sealed class DevolucionProveedorConfiguration
    : AuditableEntityConfiguration<DevolucionProveedor>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<DevolucionProveedor> builder)
    {
        builder.ToTable("DevolucionesProveedor");

        builder.Property(x => x.Numero)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.Fecha)
            .IsRequired();

        builder.Property(x => x.Estado)
            .IsRequired()
            .HasDefaultValue(EstadoDevolucionProveedor.Borrador)
            .HasSentinel(0);

        builder.Property(x => x.Motivo)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(x => x.Observacion)
            .HasMaxLength(500);

        builder.Property(x => x.AutorizadoPorId)
            .HasMaxLength(100);

        builder.Property(x => x.FechaAutorizacion);

        builder.HasIndex(x => x.Numero)
            .IsUnique();

        builder.HasOne(x => x.Proveedor)
            .WithMany()
            .HasForeignKey(x => x.ProveedorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Almacen)
            .WithMany()
            .HasForeignKey(x => x.AlmacenId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.RecepcionCompra)
            .WithMany()
            .HasForeignKey(x => x.RecepcionCompraId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.MovimientoInventario)
            .WithMany()
            .HasForeignKey(x => x.MovimientoInventarioId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Detalles)
            .WithOne(x => x.DevolucionProveedor)
            .HasForeignKey(x => x.DevolucionProveedorId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
