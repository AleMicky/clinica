using Clinica.Modules.Almacen.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Almacen.Infrastructure.Persistence.Configurations;

public sealed class ProductoConfiguration : BaseEntityConfiguration<Producto>
{
    public override void Configure(EntityTypeBuilder<Producto> builder)
    {
        base.Configure(builder);
        builder.ToTable("Productos");
        builder.Property(x => x.Codigo).HasMaxLength(50).IsRequired();
        builder.HasIndex(x => x.Codigo).IsUnique();
        builder.Property(x => x.Nombre).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Descripcion).HasMaxLength(500);
        builder.Property(x => x.CodigoBarras).HasMaxLength(100);
        builder.HasIndex(x => x.CodigoBarras).IsUnique().HasFilter("[CodigoBarras] IS NOT NULL");
        builder.Property(x => x.StockMinimo).HasPrecision(18, 4).HasDefaultValue(0m);
        builder.Property(x => x.StockMaximo).HasPrecision(18, 4).HasDefaultValue(0m);
        builder.Property(x => x.Activo).HasDefaultValue(true);
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);

        builder.HasOne(x => x.CategoriaProducto)
            .WithMany(x => x.Productos)
            .HasForeignKey(x => x.CategoriaProductoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.UnidadMedida)
            .WithMany()
            .HasForeignKey(x => x.UnidadMedidaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.MedicamentoDetalle)
            .WithOne(x => x.Producto)
            .HasForeignKey<MedicamentoDetalle>(x => x.ProductoId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
