using Clinica.Api.Modules.Parametros.MetodoPago.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Parametros;

public sealed class MetodoPagoConfiguration
    : AuditableEntityConfiguration<MetodoPago>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<MetodoPago> builder)
    {
        builder.ToTable("MetodosPago");

        builder.Property(x => x.Codigo)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.Nombre)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.RequiereReferencia)
            .HasDefaultValue(false);

        builder.HasIndex(x => x.Codigo)
            .IsUnique();
    }
}
