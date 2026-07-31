using Clinica.Modules.Caja.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Caja.Infrastructure.Persistence.Configurations;

public sealed class TurnoCajaConfiguration : BaseEntityConfiguration<TurnoCaja>
{
    public override void Configure(EntityTypeBuilder<TurnoCaja> builder)
    {
        base.Configure(builder);

        builder.ToTable("TurnosCaja");

        builder.Property(x => x.MontoInicial).HasPrecision(18, 2);
        builder.Property(x => x.MontoEsperado).HasPrecision(18, 2);
        builder.Property(x => x.MontoContado).HasPrecision(18, 2);
        builder.Property(x => x.Diferencia).HasPrecision(18, 2);
        builder.Property(x => x.Estado).HasMaxLength(30).IsRequired();
        builder.Property(x => x.ObservacionApertura).HasMaxLength(2000);
        builder.Property(x => x.ObservacionCierre).HasMaxLength(2000);

        builder.HasIndex(x => new { x.CajaId, x.Estado });
        builder.HasIndex(x => new { x.EmpleadoAperturaId, x.Estado });

        builder.HasOne(x => x.Caja)
            .WithMany(x => x.Turnos)
            .HasForeignKey(x => x.CajaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Arqueo)
            .WithOne(x => x.TurnoCaja)
            .HasForeignKey<ArqueoCaja>(x => x.TurnoCajaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);
    }
}
