using Clinica.Api.Modules.RecursosHumanos.Especialidad.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.RecursosHumanos;

public sealed class EspecialidadConfiguration
    : AuditableEntityConfiguration<Especialidad>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<Especialidad> builder)
    {
        builder.ToTable("Especialidades");

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
