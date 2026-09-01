using Clinica.Api.Modules.Parametros.Moneda.Entity;
using Clinica.Api.Modules.Servicios.Tarifas.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Servicios;

public sealed class TarifarioConfiguration
    : AuditableEntityConfiguration<Tarifario>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<Tarifario> builder)
    {
        builder.ToTable("Tarifarios");

        builder.Property(x => x.Codigo)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Nombre)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Descripcion)
            .HasMaxLength(250);

        builder.Property(x => x.FechaInicio)
            .IsRequired();

        builder.Property(x => x.FechaFin);

        builder.Property(x => x.EsPrincipal)
            .HasDefaultValue(false);

        builder.HasIndex(x => x.Codigo)
            .IsUnique();

        builder.HasOne(x => x.Moneda)
            .WithMany()
            .HasForeignKey(x => x.MonedaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Detalles)
            .WithOne(x => x.Tarifario)
            .HasForeignKey(x => x.TarifarioId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
