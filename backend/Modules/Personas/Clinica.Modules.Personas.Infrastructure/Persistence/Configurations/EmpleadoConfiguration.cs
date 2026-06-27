using Clinica.Modules.Personas.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Personas.Infrastructure.Persistence.Configurations;

public sealed class EmpleadoConfiguration : BaseEntityConfiguration<Empleado>
{
    public override void Configure(EntityTypeBuilder<Empleado> builder)
    {
        base.Configure(builder);

        builder.ToTable("Empleados");

        builder.Property(x => x.CodigoEmpleado)
            .HasMaxLength(30)
            .IsRequired();

        builder.HasIndex(x => x.CodigoEmpleado)
            .IsUnique();

        builder.HasIndex(x => x.PersonaId)
            .IsUnique();

        builder.HasOne(x => x.Persona)
            .WithMany()
            .HasForeignKey(x => x.PersonaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Area)
            .WithMany()
            .HasForeignKey(x => x.AreaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Departamento)
            .WithMany()
            .HasForeignKey(x => x.DepartamentoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Servicio)
            .WithMany()
            .HasForeignKey(x => x.ServicioId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Profesion)
            .WithMany()
            .HasForeignKey(x => x.ProfesionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Cargo)
            .WithMany()
            .HasForeignKey(x => x.CargoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
