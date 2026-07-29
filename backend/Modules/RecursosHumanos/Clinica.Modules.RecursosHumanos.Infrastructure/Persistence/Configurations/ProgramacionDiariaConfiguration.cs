using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Clinica.Modules.RecursosHumanos.Domain.Enums;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.RecursosHumanos.Infrastructure.Persistence.Configurations;

public sealed class ProgramacionDiariaConfiguration : BaseEntityConfiguration<ProgramacionDiaria>
{
    public override void Configure(EntityTypeBuilder<ProgramacionDiaria> builder)
    {
        base.Configure(builder);

        builder.ToTable("ProgramacionDiaria");

        builder.Property(x => x.Fecha).IsRequired();

        builder.Property(x => x.TipoAsignacion)
            .IsRequired()
            .HasDefaultValue(TipoAsignacionProgramacion.Regular);

        builder.Property(x => x.Observacion)
            .HasMaxLength(1000);

        builder.HasOne(x => x.Programacion)
            .WithMany(x => x.Detalles)
            .HasForeignKey(x => x.ProgramacionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Empleado)
            .WithMany()
            .HasForeignKey(x => x.EmpleadoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Turno)
            .WithMany()
            .HasForeignKey(x => x.TurnoId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.ProgramacionId);
        builder.HasIndex(x => x.Fecha);
        builder.HasIndex(x => x.EmpleadoId);
        builder.HasIndex(x => new { x.Fecha, x.EmpleadoId });
        builder.HasIndex(x => x.TurnoId);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
