using Clinica.Api.Modules.Recepcion.Pacientes.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Recepcion;

public class PacienteConfiguration
    : AuditableEntityConfiguration<Paciente>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<Paciente> builder)
    {
        builder.ToTable("Pacientes");

        builder.Property(x => x.PersonaId)
            .IsRequired();

        builder.Property(x => x.NumeroHistoriaClinica)
            .HasMaxLength(30)
            .IsRequired();

        builder.HasIndex(x => x.NumeroHistoriaClinica)
            .IsUnique();

        builder.HasIndex(x => x.PersonaId)
            .IsUnique();

        builder.HasOne(x => x.Persona)
            .WithMany()
            .HasForeignKey(x => x.PersonaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}