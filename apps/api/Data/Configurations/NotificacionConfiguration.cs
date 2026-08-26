using Clinica.Api.Modules.Notificaciones.Entity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public class NotificacionConfiguration
    : IEntityTypeConfiguration<Notificacion>
{
    public void Configure(
        EntityTypeBuilder<Notificacion> builder)
    {
        builder.ToTable("Notificaciones");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.UsuarioId)
            .HasMaxLength(450)
            .IsRequired();

        builder.Property(x => x.Titulo)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.Mensaje)
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(x => x.Tipo)
            .IsRequired();

        builder.Property(x => x.Modulo)
            .HasMaxLength(50);

        builder.Property(x => x.EntidadTipo)
            .HasMaxLength(100);

        builder.Property(x => x.EntidadId)
            .HasMaxLength(100);

        builder.Property(x => x.Url)
            .HasMaxLength(500);

        builder.Property(x => x.Leida)
            .HasDefaultValue(false);

        builder.HasIndex(x => x.UsuarioId);

        builder.HasIndex(x => new
        {
            x.UsuarioId,
            x.Leida
        });

        builder.HasIndex(x => new
        {
            x.UsuarioId,
            x.CreadoPor
        });
    }
}