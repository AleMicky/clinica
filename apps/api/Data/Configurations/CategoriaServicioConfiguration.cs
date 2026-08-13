using Clinica.Api.Modules.Servicios.CategoriaServicio.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public sealed class CategoriaServicioConfiguration
    : AuditableEntityConfiguration<CategoriaServicio>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<CategoriaServicio> builder)
    {
        builder.ToTable("CategoriasServicio");

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
    }
}