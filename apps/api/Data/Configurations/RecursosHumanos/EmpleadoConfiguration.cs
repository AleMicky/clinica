using Clinica.Api.Modules.RecursosHumanos.Empleado.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.RecursosHumanos;

public sealed class EmpleadoConfiguration
    : AuditableEntityConfiguration<Empleado>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<Empleado> builder)
    {
        builder.ToTable("Empleados");

        builder.Property(x => x.PersonaId)
            .IsRequired();

        builder.Property(x => x.CodigoEmpleado)
            .HasMaxLength(30);

        builder.Property(x => x.FechaIngreso)
            .IsRequired(false);

        builder.Property(x => x.FechaRetiro)
            .IsRequired(false);

        builder.HasIndex(x => x.PersonaId)
            .IsUnique();

        builder.HasIndex(x => x.CodigoEmpleado)
            .IsUnique();

        builder.HasOne(x => x.Persona)
            .WithMany()
            .HasForeignKey(x => x.PersonaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}