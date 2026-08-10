using Clinica.Api.Modules.Seguridad.Usuarios;
using Clinica.Api.Modules.Seguridad.Usuarios.Entity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public class UsuarioConfiguration
    : IEntityTypeConfiguration<Usuario>
{
    public void Configure(
        EntityTypeBuilder<Usuario> builder)
    {
        builder.ToTable("Usuarios");

        builder.Property(x => x.Activo)
            .HasDefaultValue(true);

        builder.Property(x => x.DebeCambiarPassword)
            .HasDefaultValue(false);

        builder.Property(x => x.PersonaId)
            .IsRequired();

        builder.HasIndex(x => x.PersonaId)
            .IsUnique();

        builder.HasOne(x => x.Persona)
            .WithMany()
            .HasForeignKey(x => x.PersonaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}