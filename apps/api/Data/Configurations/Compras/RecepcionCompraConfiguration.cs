using Clinica.Api.Modules.Compras.RecepcionCompra.Entity;
using Clinica.Api.Modules.Compras.RecepcionCompra.Enums;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Compras;

public sealed class RecepcionCompraConfiguration
    : AuditableEntityConfiguration<RecepcionCompra>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<RecepcionCompra> builder)
    {
        builder.ToTable("RecepcionesCompra");

        builder.Property(x => x.Numero)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.FechaRecepcion)
            .IsRequired();

        builder.Property(x => x.Estado)
            .IsRequired()
            .HasDefaultValue(EstadoRecepcionCompra.Borrador)
            .HasSentinel(0);

        builder.Property(x => x.NumeroFactura)
            .HasMaxLength(50);

        builder.Property(x => x.NumeroRemision)
            .HasMaxLength(50);

        builder.Property(x => x.RecibidoPorId)
            .HasMaxLength(100);

        builder.Property(x => x.Observacion)
            .HasMaxLength(500);

        builder.HasIndex(x => x.Numero)
            .IsUnique();

        builder.HasOne(x => x.OrdenCompra)
            .WithMany()
            .HasForeignKey(x => x.OrdenCompraId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Proveedor)
            .WithMany(x => x.Recepciones)
            .HasForeignKey(x => x.ProveedorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Almacen)
            .WithMany()
            .HasForeignKey(x => x.AlmacenId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.MovimientoInventario)
            .WithMany()
            .HasForeignKey(x => x.MovimientoInventarioId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Detalles)
            .WithOne(x => x.RecepcionCompra)
            .HasForeignKey(x => x.RecepcionCompraId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
