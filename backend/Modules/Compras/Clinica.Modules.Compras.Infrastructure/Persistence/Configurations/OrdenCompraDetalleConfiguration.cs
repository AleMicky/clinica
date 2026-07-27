using Clinica.Modules.Compras.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Compras.Infrastructure.Persistence.Configurations;

public sealed class OrdenCompraDetalleConfiguration : BaseEntityConfiguration<OrdenCompraDetalle>
{
    public override void Configure(EntityTypeBuilder<OrdenCompraDetalle> builder)
    {
        base.Configure(builder);
        builder.ToTable("OrdenesCompraDetalle");
        builder.Property(x => x.Cantidad).HasPrecision(18, 4);
        builder.Property(x => x.CostoUnitario).HasPrecision(18, 4);
        builder.Property(x => x.CantidadRecibida).HasPrecision(18, 4);
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);
    }
}
