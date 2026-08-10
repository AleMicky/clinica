using Clinica.Api.Modules.RecursosHumanos.Medico.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public sealed class MedicoConfiguration
    : AuditableEntityConfiguration<Medico>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<Medico> builder)
    {
        builder.ToTable("Medicos");

        builder.Property(x => x.MatriculaProfesional)
            .HasMaxLength(30);

        builder.Property(x => x.RegistroMinisterioSalud)
            .HasMaxLength(30);

        builder.HasIndex(x => x.MatriculaProfesional)
            .IsUnique();

        builder.HasOne(x => x.Empleado)
            .WithMany()
            .HasForeignKey(x => x.EmpleadoId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
