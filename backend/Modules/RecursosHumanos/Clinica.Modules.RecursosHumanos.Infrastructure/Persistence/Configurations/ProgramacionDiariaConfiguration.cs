using Clinica.Modules.RecursosHumanos.Domain.Entities;
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
        builder.Property(x => x.Estado).HasMaxLength(20).IsRequired();
        builder.Property(x => x.Observacion).HasMaxLength(1000);
        builder.Property(x => x.MaxPacientes).IsRequired();
        builder.Property(x => x.EsMedicoTurno).HasDefaultValue(false);
        builder.Property(x => x.AceptaConsultas).HasDefaultValue(true);
        builder.Property(x => x.AceptaSinCita).HasDefaultValue(false);
        builder.Property(x => x.PermiteMultiplesMedicosTurno).HasDefaultValue(false);

        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);

        builder.HasOne(x => x.Empleado)
            .WithMany()
            .HasForeignKey(x => x.EmpleadoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Turno)
            .WithMany()
            .HasForeignKey(x => x.TurnoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Area)
            .WithMany()
            .HasForeignKey(x => x.AreaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Cargo)
            .WithMany()
            .HasForeignKey(x => x.CargoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Especialidad)
            .WithMany()
            .HasForeignKey(x => x.EspecialidadId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.Fecha);
        builder.HasIndex(x => x.AreaId);
        builder.HasIndex(x => x.EmpleadoId);
        builder.HasIndex(x => x.TurnoId);
        builder.HasIndex(x => x.EspecialidadId);
        builder.HasIndex(x => new { x.Fecha, x.EmpleadoId });
        builder.HasIndex(x => new { x.Fecha, x.AreaId, x.EsMedicoTurno });
    }
}
