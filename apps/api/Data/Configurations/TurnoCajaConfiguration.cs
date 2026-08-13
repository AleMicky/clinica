using Clinica.Api.Modules.Cajas.TurnoCaja.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public sealed class TurnoCajaConfiguration
    : AuditableEntityConfiguration<TurnoCaja>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<TurnoCaja> builder)
    {
        builder.ToTable("TurnosCaja");

        builder.Ignore(x => x.Cobros);
        builder.Ignore(x => x.Movimientos);
        builder.Ignore(x => x.Arqueos);

        builder.Property(x => x.CajaId)
            .IsRequired();

        builder.Property(x => x.EmpleadoId)
            .IsRequired();

        builder.Property(x => x.FechaHoraApertura)
            .IsRequired();

        builder.Property(x => x.FechaHoraCierre);

        builder.Property(x => x.Estado)
            .IsRequired();

        builder.HasIndex(x => new
        {
            x.CajaId,
            x.Estado
        });

        builder.HasOne(x => x.Caja)
            .WithMany(x => x.Turnos)
            .HasForeignKey(x => x.CajaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Empleado)
            .WithMany()
            .HasForeignKey(x => x.EmpleadoId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
