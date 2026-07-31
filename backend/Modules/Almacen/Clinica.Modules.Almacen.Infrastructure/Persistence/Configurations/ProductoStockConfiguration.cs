using Clinica.Modules.Almacen.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Almacen.Infrastructure.Persistence.Configurations;

public sealed class ProductoStockConfiguration : BaseEntityConfiguration<ProductoStock>
{
    public override void Configure(EntityTypeBuilder<ProductoStock> builder)
    {
        base.Configure(builder);
        builder.ToTable("ProductosStock");
        builder.HasIndex(x => new { x.ProductoId, x.AlmacenId }).IsUnique();
        builder.Property(x => x.CantidadDisponible).HasPrecision(18, 4);
        builder.Property(x => x.CantidadReservada).HasPrecision(18, 4);
        builder.Property(x => x.StockMinimo).HasPrecision(18, 4);
        builder.Property(x => x.StockMaximo).HasPrecision(18, 4);
        builder.Ignore(x => x.CantidadUtilizable);
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);

        builder.HasOne(x => x.Producto)
            .WithMany(x => x.Stocks)
            .HasForeignKey(x => x.ProductoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Almacen)
            .WithMany(x => x.Stocks)
            .HasForeignKey(x => x.AlmacenId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
