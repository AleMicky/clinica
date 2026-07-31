using Clinica.Modules.Almacen.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Almacen.Infrastructure.Persistence.Configurations;

public sealed class MovimientoAlmacenDetalleConfiguration : BaseEntityConfiguration<MovimientoAlmacenDetalle>
{
    public override void Configure(EntityTypeBuilder<MovimientoAlmacenDetalle> builder)
    {
        base.Configure(builder);
        builder.ToTable("MovimientosAlmacenDetalle");
        builder.Property(x => x.Cantidad).HasPrecision(18, 4);
        builder.Property(x => x.CostoUnitario).HasPrecision(18, 4);
        builder.Property(x => x.CostoTotal).HasPrecision(18, 4);
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);

        builder.HasOne(x => x.Producto)
            .WithMany()
            .HasForeignKey(x => x.ProductoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ProductoLote)
            .WithMany()
            .HasForeignKey(x => x.ProductoLoteId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
