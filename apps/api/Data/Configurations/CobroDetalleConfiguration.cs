using Clinica.Api.Modules.Cajas.Cobro.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public sealed class CobroDetalleConfiguration
    : AuditableEntityConfiguration<CobroDetalle>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<CobroDetalle> builder)
    {
        builder.ToTable("CobroDetalles");

        builder.Property(x => x.CobroId)
            .IsRequired();

        builder.Property(x => x.MetodoPagoId)
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

        builder.Property(x => x.Referencia)
            .HasMaxLength(100);

        builder.Property(x => x.EntidadFinanciera)
            .HasMaxLength(100);

        builder.Property(x => x.Observacion)
            .HasMaxLength(500);

        builder.HasIndex(x => x.CobroId);

        builder.HasOne(x => x.MetodoPago)
            .WithMany()
            .HasForeignKey(x => x.MetodoPagoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Moneda)
            .WithMany()
            .HasForeignKey(x => x.MonedaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.CuentaBancaria)
            .WithMany()
            .HasForeignKey(x => x.CuentaBancariaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}