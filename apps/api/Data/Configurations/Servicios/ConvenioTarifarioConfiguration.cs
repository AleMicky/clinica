using Clinica.Api.Modules.Servicios.Convenios.Entity;
using Clinica.Api.Modules.Servicios.Tarifas.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Servicios;

public sealed class ConvenioTarifarioConfiguration
    : AuditableEntityConfiguration<ConvenioTarifario>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<ConvenioTarifario> builder)
    {
        builder.ToTable("ConvenioTarifarios");

        builder.Property(x => x.FechaInicio)
            .IsRequired();

        builder.Property(x => x.FechaFin);

        builder.HasIndex(x => new { x.ConvenioId, x.TarifarioId })
            .IsUnique();

        builder.HasOne(x => x.Convenio)
            .WithMany(x => x.Tarifarios)
            .HasForeignKey(x => x.ConvenioId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Tarifario)
            .WithMany(x => x.Convenios)
            .HasForeignKey(x => x.TarifarioId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
