using Clinica.Modules.Personas.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Personas.Infrastructure.Persistence.Configurations;

public sealed class PacienteConfiguration : BaseEntityConfiguration<Paciente>
{
    public override void Configure(EntityTypeBuilder<Paciente> builder)
    {
        base.Configure(builder);

        builder.ToTable("Pacientes");

        builder.Property(x => x.NumeroHistoriaClinica)
            .HasMaxLength(30)
            .IsRequired();

        builder.HasIndex(x => x.NumeroHistoriaClinica)
            .IsUnique();

        builder.HasIndex(x => x.PersonaId)
            .IsUnique();

        builder.Property(x => x.Alergias)
            .HasMaxLength(500);

        builder.Property(x => x.Observaciones)
            .HasMaxLength(1000);

        builder.HasOne(x => x.Persona)
            .WithMany()
            .HasForeignKey(x => x.PersonaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.GrupoSanguineo)
            .WithMany()
            .HasForeignKey(x => x.GrupoSanguineoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
