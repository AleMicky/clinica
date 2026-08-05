using Clinica.Api.Modules.Parametros.Moneda.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public sealed class MonedaConfiguration
    : AuditableEntityConfiguration<Moneda>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<Moneda> builder)
    {
        builder.ToTable("Monedas");

        builder.Property(x => x.Codigo)
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(x => x.Nombre)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Simbolo)
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(x => x.Decimales)
            .HasDefaultValue(2);

        builder.HasIndex(x => x.Codigo)
            .IsUnique();
    }
}