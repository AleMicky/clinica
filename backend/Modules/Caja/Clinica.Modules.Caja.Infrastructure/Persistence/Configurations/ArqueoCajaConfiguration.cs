using Clinica.Modules.Caja.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Caja.Infrastructure.Persistence.Configurations;

public sealed class ArqueoCajaConfiguration : BaseEntityConfiguration<ArqueoCaja>
{
    public override void Configure(EntityTypeBuilder<ArqueoCaja> builder)
    {
        base.Configure(builder);

        builder.ToTable("ArqueosCaja");

        builder.HasIndex(x => x.TurnoCajaId).IsUnique();

        builder.Property(x => x.MontoInicial).HasPrecision(18, 2);
        builder.Property(x => x.IngresosEfectivo).HasPrecision(18, 2);
        builder.Property(x => x.EgresosEfectivo).HasPrecision(18, 2);
        builder.Property(x => x.MontoEsperado).HasPrecision(18, 2);
        builder.Property(x => x.MontoContado).HasPrecision(18, 2);
        builder.Property(x => x.Diferencia).HasPrecision(18, 2);
        builder.Property(x => x.Observaciones).HasMaxLength(2000);

        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);
    }
}
