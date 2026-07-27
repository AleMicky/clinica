using Clinica.Modules.Farmacia.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Farmacia.Infrastructure.Persistence.Configurations;

public sealed class RecetaDetalleConfiguration : BaseEntityConfiguration<RecetaDetalle>
{
    public override void Configure(EntityTypeBuilder<RecetaDetalle> builder)
    {
        base.Configure(builder);
        builder.ToTable("RecetaDetalles");
        builder.Property(x => x.Cantidad).HasPrecision(18, 4);
        builder.Property(x => x.Indicaciones).HasMaxLength(500);
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);
    }
}
