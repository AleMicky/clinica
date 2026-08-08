using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public sealed class CategoriaConfiguration
    : AuditableEntityConfiguration<CategoriaServicio>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<CategoriaServicio> builder
    )
    {
        builder.ToTable("Categorias");

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
        
        builder.HasOne(x => x.CategoriaServicio)
            .WithMany(x => x.Servicios)
            .HasForeignKey(x => x.CategoriaServicioId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}