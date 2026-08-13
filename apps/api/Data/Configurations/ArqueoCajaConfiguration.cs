using Clinica.Api.Modules.Cajas.ArqueoCaja.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public sealed class ArqueoCajaConfiguration
    : AuditableEntityConfiguration<ArqueoCaja>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<ArqueoCaja> builder)
    {
        builder.ToTable("ArqueosCaja");

        builder.Ignore(x => x.Detalles);

        builder.Property(x => x.TurnoCajaId)
            .IsRequired();

        builder.Property(x => x.FechaHora)
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

        builder.HasIndex(x => x.TurnoCajaId);

        builder.HasOne(x => x.TurnoCaja)
            .WithMany()
            .HasForeignKey(x => x.TurnoCajaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}