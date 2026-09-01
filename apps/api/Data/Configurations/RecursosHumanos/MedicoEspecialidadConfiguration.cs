using Clinica.Api.Modules.RecursosHumanos.Medico.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.RecursosHumanos;

public sealed class MedicoEspecialidadConfiguration
    : AuditableEntityConfiguration<MedicoEspecialidad>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<MedicoEspecialidad> builder)
    {
        builder.ToTable("MedicosEspecialidades");

        builder.Property(x => x.EsPrincipal)
            .HasDefaultValue(false);

        builder.HasIndex(x => new
        {
            x.MedicoId,
            x.EspecialidadId
        }).IsUnique();

        builder.HasOne(x => x.Medico)
            .WithMany(x => x.Especialidades)
            .HasForeignKey(x => x.MedicoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Especialidad)
            .WithMany()
            .HasForeignKey(x => x.EspecialidadId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
