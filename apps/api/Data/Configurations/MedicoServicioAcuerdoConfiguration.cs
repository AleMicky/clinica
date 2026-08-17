using Clinica.Api.Modules.RecursosHumanos.Medico.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public sealed class MedicoServicioAcuerdoConfiguration
    : AuditableEntityConfiguration<MedicoServicioAcuerdo>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<MedicoServicioAcuerdo> builder)
    {
        builder.ToTable("MedicosServiciosAcuerdos");

        builder.Property(x => x.ImporteServicio)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.ImporteClinica)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.ImporteMedico)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.FechaInicio)
            .IsRequired();

        builder.Property(x => x.FechaFin);

        builder.HasIndex(x => new
        {
            x.MedicoId,
            x.ServicioId
        });

        builder.HasOne(x => x.Medico)
            .WithMany()
            .HasForeignKey(x => x.MedicoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Servicio)
            .WithMany()
            .HasForeignKey(x => x.ServicioId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}