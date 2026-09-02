using Clinica.Api.Modules.Compras.CotizacionCompra.Entity;
using Clinica.Api.Modules.Compras.CotizacionCompra.Enums;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Compras;

public sealed class CotizacionCompraConfiguration
    : AuditableEntityConfiguration<CotizacionCompra>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<CotizacionCompra> builder)
    {
        builder.ToTable("CotizacionesCompra");

        builder.Property(x => x.Numero)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.Fecha)
            .IsRequired();

        builder.Property(x => x.Estado)
            .IsRequired()
            .HasDefaultValue(EstadoCotizacionCompra.Borrador)
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

        builder.Property(x => x.TiempoEntrega)
            .HasMaxLength(100);

        builder.Property(x => x.Observacion)
            .HasMaxLength(500);

        builder.HasIndex(x => x.Numero)
            .IsUnique();

        builder.HasOne(x => x.Proveedor)
            .WithMany(x => x.Cotizaciones)
            .HasForeignKey(x => x.ProveedorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.SolicitudCompra)
            .WithMany()
            .HasForeignKey(x => x.SolicitudCompraId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Detalles)
            .WithOne(x => x.CotizacionCompra)
            .HasForeignKey(x => x.CotizacionCompraId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
