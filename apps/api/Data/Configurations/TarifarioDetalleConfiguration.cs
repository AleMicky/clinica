using Clinica.Api.Modules.Servicios.Servicios.Entity;
using Clinica.Api.Modules.Servicios.Tarifas.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public sealed class TarifarioDetalleConfiguration
    : AuditableEntityConfiguration<TarifarioDetalle>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<TarifarioDetalle> builder)
    {
        builder.ToTable("TarifarioDetalles");

        builder.Property(x => x.Precio)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.HasIndex(x => new { x.TarifarioId, x.ServicioId })
            .IsUnique();

        builder.HasOne(x => x.Servicio)
            .WithMany(x => x.Tarifas)
            .HasForeignKey(x => x.ServicioId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
