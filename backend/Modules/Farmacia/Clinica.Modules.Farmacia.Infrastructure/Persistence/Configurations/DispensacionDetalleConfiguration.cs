using Clinica.Modules.Farmacia.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Farmacia.Infrastructure.Persistence.Configurations;

public sealed class DispensacionDetalleConfiguration : BaseEntityConfiguration<DispensacionDetalle>
{
    public override void Configure(EntityTypeBuilder<DispensacionDetalle> builder)
    {
        base.Configure(builder);
        builder.ToTable("DispensacionDetalles");
        builder.Property(x => x.Cantidad).HasPrecision(18, 4);
        builder.Property(x => x.PrecioUnitario).HasPrecision(18, 2);
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);
    }
}
