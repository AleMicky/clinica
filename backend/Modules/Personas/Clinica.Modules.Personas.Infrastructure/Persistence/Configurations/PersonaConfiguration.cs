using Clinica.Modules.Parametros.Domain.Entities;
using Clinica.Modules.Personas.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Personas.Infrastructure.Persistence.Configurations;

public sealed class PersonaConfiguration : BaseEntityConfiguration<Persona>
{
    public override void Configure(EntityTypeBuilder<Persona> builder)
    {
        base.Configure(builder);

        builder.ToTable("Personas");

        builder.Property(x => x.Nombres)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.ApellidoPaterno)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.ApellidoMaterno)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.NumeroDocumento)
            .HasMaxLength(20)
            .IsRequired();

        builder.HasIndex(x => new { x.TipoDocumentoId, x.NumeroDocumento })
            .IsUnique();

        builder.Property(x => x.ComplementoDocumento)
            .HasMaxLength(10);

        builder.Property(x => x.Telefono)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.Direccion)
            .HasMaxLength(500)
            .IsRequired();

        builder.HasOne(x => x.TipoDocumento)
            .WithMany()
            .HasForeignKey(x => x.TipoDocumentoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ExtensionDocumento)
            .WithMany()
            .HasForeignKey(x => x.ExtensionDocumentoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Sexo)
            .WithMany()
            .HasForeignKey(x => x.SexoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.EstadoCivil)
            .WithMany()
            .HasForeignKey(x => x.EstadoCivilId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.ContactosEmergencia)
            .WithOne(x => x.Persona)
            .HasForeignKey(x => x.PersonaId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
