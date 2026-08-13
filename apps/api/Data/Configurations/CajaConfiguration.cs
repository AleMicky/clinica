using Clinica.Api.Modules.Cajas.Caja.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public sealed class CajaConfiguration
    : AuditableEntityConfiguration<Caja>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<Caja> builder)
    {
        builder.ToTable("Cajas");

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
