using Clinica.Modules.Personas.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Personas.Infrastructure.Persistence.Configurations;

public sealed class MedicoConfiguration : BaseEntityConfiguration<Medico>
{
    public override void Configure(EntityTypeBuilder<Medico> builder)
    {
        base.Configure(builder);

        builder.ToTable("Medicos");

        builder.Property(x => x.MatriculaProfesional)
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(x => x.MatriculaProfesional)
            .IsUnique();

        builder.HasIndex(x => x.EmpleadoId)
            .IsUnique();

        builder.Property(x => x.RegistroColegioMedico)
            .HasMaxLength(50);

        builder.HasOne(x => x.Empleado)
            .WithMany()
            .HasForeignKey(x => x.EmpleadoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Especialidad)
            .WithMany()
            .HasForeignKey(x => x.EspecialidadId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
