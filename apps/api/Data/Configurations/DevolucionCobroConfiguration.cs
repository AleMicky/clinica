using Clinica.Api.Modules.Cajas.DevolucionCobro.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public sealed class DevolucionCobroConfiguration
    : AuditableEntityConfiguration<DevolucionCobro>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<DevolucionCobro> builder)
    {
        builder.ToTable("DevolucionesCobro");

        builder.Property(x => x.Numero)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.CobroId)
            .IsRequired();

        builder.Property(x => x.TurnoCajaId)
            .IsRequired();

        builder.Property(x => x.FechaHora)
            .IsRequired();

        builder.Property(x => x.Monto)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.Motivo)
            .HasMaxLength(500)
            .IsRequired();

        builder.HasIndex(x => x.Numero)
            .IsUnique()
            .HasFilter("[Activo] = 1");

        builder.HasIndex(x => x.CobroId);
        builder.HasIndex(x => x.TurnoCajaId);

        builder.HasOne(x => x.Cobro)
            .WithMany()
            .HasForeignKey(x => x.CobroId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.TurnoCaja)
            .WithMany()
            .HasForeignKey(x => x.TurnoCajaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}