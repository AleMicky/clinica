using Clinica.Api.Modules.Recepcion.Admision.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public sealed class AdmisionDetalleConfiguration
    : AuditableEntityConfiguration<AdmisionDetalle>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<AdmisionDetalle> builder)
    {
        builder.ToTable("AdmisionDetalles");

        builder.Property(x => x.Cantidad)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.PrecioUnitario)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.Descuento)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.Total)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.HasIndex(x => new { x.AdmisionId, x.ServicioId })
            .IsUnique()
            .HasFilter("[Activo] = 1");

        builder.HasOne(x => x.Servicio)
            .WithMany()
            .HasForeignKey(x => x.ServicioId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Medico)
            .WithMany()
            .HasForeignKey(x => x.MedicoId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
