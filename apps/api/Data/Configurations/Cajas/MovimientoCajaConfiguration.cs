using Clinica.Api.Modules.Cajas.MovimientoCaja.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Cajas;

public sealed class MovimientoCajaConfiguration
    : AuditableEntityConfiguration<MovimientoCaja>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<MovimientoCaja> builder)
    {
        builder.ToTable("MovimientosCaja");

        builder.Property(x => x.TurnoCajaId)
            .IsRequired();

        builder.Property(x => x.Tipo)
            .IsRequired();

        builder.Property(x => x.FechaHora)
            .IsRequired();

        builder.Property(x => x.MonedaId)
            .IsRequired();

        builder.Property(x => x.Monto)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.TipoCambio)
            .HasPrecision(18, 6)
            .IsRequired();

        builder.Property(x => x.MontoMonedaBase)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.Concepto)
            .HasMaxLength(250)
            .IsRequired();

        builder.Property(x => x.Referencia)
            .HasMaxLength(100);

        builder.Property(x => x.Observacion)
            .HasMaxLength(500);

        builder.HasIndex(x => x.TurnoCajaId);

        builder.HasIndex(x => x.MonedaId);

        builder.HasIndex(x => new
        {
            x.TurnoCajaId,
            x.Tipo
        });

        builder.HasIndex(x => new
        {
            x.TurnoCajaId,
            x.MonedaId
        });

        builder.HasOne(x => x.TurnoCaja)
            .WithMany()
            .HasForeignKey(x => x.TurnoCajaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Moneda)
            .WithMany()
            .HasForeignKey(x => x.MonedaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}