using Clinica.Modules.Farmacia.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Farmacia.Infrastructure.Persistence.Configurations;

public sealed class PrecioConfiguration : BaseEntityConfiguration<Precio>
{
    public override void Configure(EntityTypeBuilder<Precio> builder)
    {
        base.Configure(builder);
        builder.ToTable("Precios");
        builder.Property(x => x.Importe).HasPrecision(18, 2);
        builder.Property(x => x.MotivoCambio).HasMaxLength(500).IsRequired();
        builder.HasIndex(x => new { x.ProductoId, x.FechaInicio });
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);
    }
}
