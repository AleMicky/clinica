using Clinica.Api.Modules.RecursosHumanos.TipoArea.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public sealed class TipoAreaConfiguration
    : AuditableEntityConfiguration<TipoArea>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<TipoArea> builder)
    {
        builder.ToTable("TiposArea");

        builder.Property(x => x.Codigo)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.Nombre)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Descripcion)
            .HasMaxLength(250);

        builder.Property(x => x.Orden)
            .HasDefaultValue(0);

        builder.HasIndex(x => x.Codigo)
            .IsUnique();
    }
}