using Clinica.Api.Modules.RecursosHumanos.Empleado.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

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
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(x => x.FechaIngreso)
            .IsRequired();

        builder.Property(x => x.FechaRetiro);

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