using Clinica.Api.Modules.Cajas.ArqueoCaja.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Cajas;

public sealed class DetalleArqueoCajaConfiguration
    : AuditableEntityConfiguration<DetalleArqueoCaja>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<DetalleArqueoCaja> builder)
    {
        builder.ToTable("DetalleArqueosCaja");

        builder.Property(x => x.ArqueoCajaId)
            .IsRequired();

        builder.Property(x => x.MetodoPagoId)
            .IsRequired();

        builder.Property(x => x.MonedaId)
            .IsRequired();

        builder.Property(x => x.MontoEsperado)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.MontoContado)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.Diferencia)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.HasIndex(x => x.ArqueoCajaId);

        builder.HasOne(x => x.ArqueoCaja)
            .WithMany(x => x.Detalles)
            .HasForeignKey(x => x.ArqueoCajaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.MetodoPago)
            .WithMany()
            .HasForeignKey(x => x.MetodoPagoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Moneda)
            .WithMany()
            .HasForeignKey(x => x.MonedaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}