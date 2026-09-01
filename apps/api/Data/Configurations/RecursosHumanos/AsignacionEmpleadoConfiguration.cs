using Clinica.Api.Modules.RecursosHumanos.AsignacionEmpleado.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.RecursosHumanos;

public sealed class AsignacionEmpleadoConfiguration
    : AuditableEntityConfiguration<AsignacionEmpleado>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<AsignacionEmpleado> builder)
    {
        builder.ToTable("AsignacionesEmpleado");

        builder.Property(x => x.EmpleadoId)
            .IsRequired();

        builder.Property(x => x.AreaId)
            .IsRequired();

        builder.Property(x => x.CargoId)
            .IsRequired();

        builder.Property(x => x.FechaInicio)
            .IsRequired();

        builder.Property(x => x.FechaFin);

        builder.Property(x => x.Observacion)
            .HasMaxLength(500);

        builder.HasIndex(x => new
        {
            x.EmpleadoId,
            x.FechaInicio
        });

        builder.HasOne(x => x.Empleado)
            .WithMany(x => x.Asignaciones)
            .HasForeignKey(x => x.EmpleadoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Area)
            .WithMany(x => x.Asignaciones)
            .HasForeignKey(x => x.AreaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Cargo)
            .WithMany(x => x.Asignaciones)
            .HasForeignKey(x => x.CargoId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}