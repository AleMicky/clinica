using Clinica.Api.Modules.Cajas.Cobro.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public sealed class CobroConfiguration
    : AuditableEntityConfiguration<Cobro>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<Cobro> builder)
    {
        builder.ToTable("Cobros");

        builder.Property(x => x.Numero)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.TurnoCajaId)
            .IsRequired();

        builder.Property(x => x.VentaPagadorId)
            .IsRequired();

        builder.Property(x => x.FechaHora)
            .IsRequired();

        builder.Property(x => x.Total)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.Estado)
            .IsRequired();

        builder.Property(x => x.Observacion)
            .HasMaxLength(500);

        builder.Property(x => x.MotivoAnulacion)
            .HasMaxLength(500);

        builder.HasIndex(x => x.Numero)
            .IsUnique()
            .HasFilter("[Activo] = 1");

        builder.HasIndex(x => x.TurnoCajaId);
        builder.HasIndex(x => x.VentaPagadorId);

        builder.HasOne(x => x.TurnoCaja)
            .WithMany()
            .HasForeignKey(x => x.TurnoCajaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.VentaPagador)
            .WithMany()
            .HasForeignKey(x => x.VentaPagadorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Detalles)
            .WithOne(x => x.Cobro)
            .HasForeignKey(x => x.CobroId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}