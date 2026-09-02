using Clinica.Api.Modules.Compras.OrdenCompra.Entity;
using Clinica.Api.Modules.Compras.OrdenCompra.Enums;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Compras;

public sealed class OrdenCompraConfiguration
    : AuditableEntityConfiguration<OrdenCompra>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<OrdenCompra> builder)
    {
        builder.ToTable("OrdenesCompra");

        builder.Property(x => x.Numero)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.Fecha)
            .IsRequired();

        builder.Property(x => x.Estado)
            .IsRequired()
            .HasDefaultValue(EstadoOrdenCompra.Borrador)
            .HasSentinel(0);

        builder.Property(x => x.Subtotal)
            .HasPrecision(18, 2);

        builder.Property(x => x.Descuento)
            .HasPrecision(18, 2);

        builder.Property(x => x.Impuesto)
            .HasPrecision(18, 2);

        builder.Property(x => x.Total)
            .HasPrecision(18, 2);

        builder.Property(x => x.CondicionPago)
            .HasMaxLength(100);

        builder.Property(x => x.Observacion)
            .HasMaxLength(500);

        builder.Property(x => x.AprobadoPorId)
            .HasMaxLength(100);

        builder.HasIndex(x => x.Numero)
            .IsUnique();

        builder.HasOne(x => x.Proveedor)
            .WithMany(x => x.OrdenesCompra)
            .HasForeignKey(x => x.ProveedorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Almacen)
            .WithMany()
            .HasForeignKey(x => x.AlmacenId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.SolicitudCompra)
            .WithMany()
            .HasForeignKey(x => x.SolicitudCompraId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.CotizacionCompra)
            .WithMany()
            .HasForeignKey(x => x.CotizacionCompraId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Detalles)
            .WithOne(x => x.OrdenCompra)
            .HasForeignKey(x => x.OrdenCompraId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
