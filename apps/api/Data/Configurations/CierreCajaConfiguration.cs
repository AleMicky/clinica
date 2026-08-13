using Clinica.Api.Modules.Cajas.CierreCaja.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public sealed class CierreCajaConfiguration
    : AuditableEntityConfiguration<CierreCaja>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<CierreCaja> builder)
    {
        builder.ToTable("CierresCaja");

        builder.Property(x => x.TurnoCajaId)
            .IsRequired();

        builder.Property(x => x.ArqueoCajaId)
            .IsRequired();

        builder.Property(x => x.FechaHora)
            .IsRequired();

        builder.Property(x => x.MontoApertura)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.TotalIngresos)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.TotalEgresos)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.TotalCobros)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.TotalEsperado)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.TotalContado)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.Diferencia)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.Observacion)
            .HasMaxLength(500);

        builder.HasIndex(x => x.TurnoCajaId)
            .IsUnique();

        builder.HasOne(x => x.TurnoCaja)
            .WithMany()
            .HasForeignKey(x => x.TurnoCajaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ArqueoCaja)
            .WithMany()
            .HasForeignKey(x => x.ArqueoCajaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}