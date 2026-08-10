using Clinica.Api.Modules.Seguridad.Personas.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public sealed class PersonaConfiguration
    : AuditableEntityConfiguration<Persona>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<Persona> builder)
    {
        builder.ToTable("Personas");

        builder.Property(x => x.Nombres)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.ApellidoPaterno)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.ApellidoMaterno)
            .HasMaxLength(50);

        builder.Property(x => x.FechaNacimiento)
            .IsRequired();

        builder.Property(x => x.Telefono)
            .HasMaxLength(30);

        builder.Property(x => x.Direccion)
            .HasMaxLength(200);

        builder.Property(x => x.TipoDocumento)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.NumeroDocumento)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.ExtensionDocumento)
            .HasMaxLength(50);

        builder.Property(x => x.ComplementoDocumento)
            .HasMaxLength(10);

        builder.Property(x => x.Genero)
            .HasMaxLength(20);

        builder.Property(x => x.EstadoCivil)
            .HasMaxLength(20);

        builder.HasIndex(x => new
        {
            x.TipoDocumento,
            x.NumeroDocumento,
            x.ComplementoDocumento
        })
        .IsUnique()
        .HasFilter("[ComplementoDocumento] IS NOT NULL");

        builder.HasIndex(x => new
        {
            x.TipoDocumento,
            x.NumeroDocumento
        })
        .IsUnique()
        .HasFilter("[ComplementoDocumento] IS NULL");
    }
}