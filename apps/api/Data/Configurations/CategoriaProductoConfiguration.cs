using Clinica.Api.Modules.Almacenes.CategoriaProducto.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public sealed class CategoriaProductoConfiguration
    : AuditableEntityConfiguration<CategoriaProducto>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<CategoriaProducto> builder)
    {
        builder.ToTable("CategoriasProducto");

        builder.Property(x => x.Codigo)
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(x => x.Nombre)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Descripcion)
            .HasMaxLength(250);

        builder.HasIndex(x => x.Codigo)
            .IsUnique();

        builder.HasOne(x => x.CategoriaPadre)
            .WithMany(x => x.Subcategorias)
            .HasForeignKey(x => x.CategoriaPadreId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
