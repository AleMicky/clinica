using Clinica.Api.Modules.Almacenes.Producto.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Almacenes;

public sealed class ProductoConfiguration
    : AuditableEntityConfiguration<Producto>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<Producto> builder)
    {
        builder.ToTable("Productos");

        builder.Property(x => x.Codigo)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.Nombre)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(x => x.Descripcion)
            .HasMaxLength(500);

        builder.Property(x => x.StockMinimo)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.StockMaximo)
            .HasPrecision(18, 2);

        builder.HasIndex(x => x.Codigo)
            .IsUnique();

        builder.HasOne(x => x.CategoriaProducto)
            .WithMany()
            .HasForeignKey(x => x.CategoriaProductoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.UnidadMedida)
            .WithMany()
            .HasForeignKey(x => x.UnidadMedidaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
