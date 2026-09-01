using Clinica.Api.Modules.Recepcion.Pacientes.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Recepcion;

public sealed class PacienteConvenioConfiguration
    : AuditableEntityConfiguration<PacienteConvenio>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<PacienteConvenio> builder)
    {
        builder.ToTable("PacientesConvenios");

        builder.Property(x => x.NumeroAfiliado)
            .HasMaxLength(50);

        builder.Property(x => x.FechaInicio)
            .IsRequired();

        builder.Property(x => x.FechaFin);

        builder.Property(x => x.EsPrincipal)
            .HasDefaultValue(false);

        builder.HasIndex(x => new
        {
            x.PacienteId,
            x.ConvenioId
        }).IsUnique();

        builder.HasOne(x => x.Paciente)
            .WithMany()
            .HasForeignKey(x => x.PacienteId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Convenio)
            .WithMany()
            .HasForeignKey(x => x.ConvenioId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
