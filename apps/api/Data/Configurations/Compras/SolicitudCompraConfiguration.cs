using Clinica.Api.Modules.Compras.SolicitudCompra.Entity;
using Clinica.Api.Modules.Compras.SolicitudCompra.Enums;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Compras;

public sealed class SolicitudCompraConfiguration
    : AuditableEntityConfiguration<SolicitudCompra>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<SolicitudCompra> builder)
    {
        builder.ToTable("SolicitudesCompra");

        builder.Property(x => x.Numero)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.FechaSolicitud)
            .IsRequired();

        builder.Property(x => x.Estado)
            .IsRequired()
            .HasDefaultValue(EstadoSolicitudCompra.Borrador)
            .HasSentinel(0);

        builder.Property(x => x.Observacion)
            .HasMaxLength(500);

        builder.Property(x => x.ObservacionAprobacion)
            .HasMaxLength(500);

        builder.Property(x => x.SolicitadoPorId)
            .HasMaxLength(100);

        builder.Property(x => x.AprobadoPorId)
            .HasMaxLength(100);

        builder.HasIndex(x => x.Numero)
            .IsUnique();

        builder.HasOne(x => x.Almacen)
            .WithMany()
            .HasForeignKey(x => x.AlmacenId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Detalles)
            .WithOne(x => x.SolicitudCompra)
            .HasForeignKey(x => x.SolicitudCompraId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
