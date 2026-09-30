using Clinica.Api.Modules.Almacenes.Marca.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Almacenes;

public sealed class MarcaConfiguration
    : AuditableEntityConfiguration<Marca>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<Marca> builder)
    {
        builder.ToTable("Marcas");

        builder.Property(x => x.Codigo)
            .HasMaxLength(20)
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
