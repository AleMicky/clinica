using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.RecursosHumanos.Infrastructure.Persistence.Configurations;

public sealed class GrupoProgramacionEmpleadoConfiguration : BaseEntityConfiguration<GrupoProgramacionEmpleado>
{
    public override void Configure(EntityTypeBuilder<GrupoProgramacionEmpleado> builder)
    {
        base.Configure(builder);

        builder.ToTable("GrupoProgramacionEmpleado");

        builder.HasOne(x => x.GrupoProgramacion)
            .WithMany(x => x.Empleados)
            .HasForeignKey(x => x.GrupoProgramacionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Empleado)
            .WithMany()
            .HasForeignKey(x => x.EmpleadoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.GrupoProgramacionId, x.EmpleadoId })
            .IsUnique();

        builder.HasIndex(x => x.EmpleadoId);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
