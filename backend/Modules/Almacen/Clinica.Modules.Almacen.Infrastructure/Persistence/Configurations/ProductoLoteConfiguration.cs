using Clinica.Modules.Almacen.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Almacen.Infrastructure.Persistence.Configurations;

public sealed class ProductoLoteConfiguration : BaseEntityConfiguration<ProductoLote>
{
    public override void Configure(EntityTypeBuilder<ProductoLote> builder)
    {
        base.Configure(builder);
        builder.ToTable("ProductosLote");
        builder.HasIndex(x => new { x.ProductoId, x.AlmacenId, x.NumeroLote }).IsUnique();
        builder.Property(x => x.NumeroLote).HasMaxLength(100).IsRequired();
        builder.Property(x => x.CantidadInicial).HasPrecision(18, 4);
        builder.Property(x => x.CantidadDisponible).HasPrecision(18, 4);
        builder.Property(x => x.CantidadReservada).HasPrecision(18, 4);
        builder.Property(x => x.CostoUnitario).HasPrecision(18, 4);
        builder.Property(x => x.MotivoBloqueo).HasMaxLength(500);
        builder.Ignore(x => x.CantidadUtilizable);
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);

        builder.HasOne(x => x.Producto)
            .WithMany(x => x.Lotes)
            .HasForeignKey(x => x.ProductoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Almacen)
            .WithMany(x => x.Lotes)
            .HasForeignKey(x => x.AlmacenId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
