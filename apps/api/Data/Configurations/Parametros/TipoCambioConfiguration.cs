using Clinica.Api.Modules.Parametros.Moneda.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Parametros;

public sealed class TipoCambioConfiguration
    : AuditableEntityConfiguration<TipoCambio>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<TipoCambio> builder)
    {
        builder.ToTable("TiposCambio");

        builder.Property(x => x.Compra)
            .HasColumnType("decimal(18, 4)")
            .IsRequired();

        builder.Property(x => x.Venta)
            .HasColumnType("decimal(18, 4)")
            .IsRequired();

        builder.Property(x => x.Fecha)
            .IsRequired();

        builder.HasOne(x => x.MonedaOrigen)
            .WithMany()
            .HasForeignKey(x => x.MonedaOrigenId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.MonedaDestino)
            .WithMany()
            .HasForeignKey(x => x.MonedaDestinoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new
        {
            x.MonedaOrigenId,
            x.MonedaDestinoId,
            x.Fecha
        }).IsUnique();
    }
}